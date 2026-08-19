create schema if not exists private;

do $$
begin
  if (select column_default is null
      from information_schema.columns
      where table_schema = 'public' and table_name = 'yellow_workers' and column_name = 'id') then
    create sequence if not exists public.yellow_workers_id_seq owned by public.yellow_workers.id;
    perform setval('public.yellow_workers_id_seq', greatest(coalesce((select max(id) from public.yellow_workers), 0) + 1, 1), false);
    alter table public.yellow_workers alter column id set default nextval('public.yellow_workers_id_seq');
  end if;
end;
$$;

create table if not exists private.worker_connect_trades (
  canonical_name text primary key,
  sort_order integer not null check (sort_order > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table private.worker_connect_trades enable row level security;
revoke all on table private.worker_connect_trades from public, anon, authenticated;

insert into private.worker_connect_trades (canonical_name, sort_order) values
  ('Labourer', 10), ('Carpenter', 20), ('Shuttering Carpenter', 30),
  ('Dryliner', 40), ('Painter & Decorator', 50), ('Electrician', 60),
  ('Plumber', 70), ('Bricklayer', 80), ('Groundworker', 90),
  ('Multi Trader', 100), ('Multi Skilled Worker', 110), ('Fire Stopper', 120),
  ('Telehandler', 130), ('Forklift', 140), ('Welfare / Cleaner', 150),
  ('Handyman', 160), ('Site Manager / Supervisor', 170), ('Steel Fixer', 180),
  ('Traffic Marshal', 190), ('Tiler', 200), ('Plasterer', 210),
  ('Roofer', 220), ('Dumper Driver', 230), ('360 Operator / Excavator Driver', 240),
  ('Tape & Jointer', 250), ('Cladder', 260), ('Scaffolder', 270),
  ('Welder', 280), ('Slinger / Signaller', 290), ('Duct Fitter', 300),
  ('Hoist Operator', 310), ('Banksman', 320), ('Hod Carrier', 330),
  ('Joiner', 340), ('Ceiling Fixer', 350), ('Curtain Wall Fixer', 360),
  ('Steel Erector', 370), ('Pipe Fitter', 380), ('Driver', 390),
  ('Altă meserie', 400)
on conflict (canonical_name) do update
set sort_order = excluded.sort_order, is_active = true;

create table if not exists private.worker_connect_profiles (
  worker_id bigint primary key references public.yellow_workers(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 80),
  full_name_normalized text not null check (char_length(full_name_normalized) between 2 and 80),
  phone_raw text not null check (char_length(phone_raw) between 10 and 32),
  phone_normalized text not null unique check (phone_normalized ~ '^\+447[0-9]{9}$'),
  postcode_raw text not null check (char_length(postcode_raw) between 5 and 12),
  postcode_normalized text not null check (char_length(postcode_normalized) between 5 and 8),
  postcode_outward text not null check (char_length(postcode_outward) between 2 and 4),
  trades_canonical text[] not null check (cardinality(trades_canonical) between 1 and 5),
  other_trade_text text check (other_trade_text is null or char_length(other_trade_text) between 2 and 50),
  source text not null default 'worker_connect_uk_public',
  campaign jsonb not null default '{}'::jsonb,
  consent_contact boolean not null check (consent_contact = true),
  consent_timestamp timestamptz not null,
  consent_text_version text not null check (char_length(consent_text_version) between 3 and 40),
  verification_status text not null default 'Pending verification' check (verification_status in ('Pending verification', 'Verified', 'Rejected')),
  duplicate_status text not null default 'clear' check (duplicate_status in ('clear', 'possible_duplicate', 'name_mismatch')),
  review_reason text,
  first_submitted_at timestamptz not null default now(),
  last_submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table private.worker_connect_profiles enable row level security;
revoke all on table private.worker_connect_profiles from public, anon, authenticated;

create table if not exists private.worker_connect_submissions (
  submission_id uuid primary key,
  worker_id bigint references public.yellow_workers(id) on delete set null,
  submitted_full_name text not null check (char_length(submitted_full_name) between 2 and 80),
  submitted_full_name_normalized text not null,
  phone_normalized text not null check (phone_normalized ~ '^\+447[0-9]{9}$'),
  submitted_postcode text not null,
  submitted_trades text[] not null check (cardinality(submitted_trades) between 1 and 5),
  other_trade_text text,
  source text not null,
  campaign jsonb not null default '{}'::jsonb,
  consent_contact boolean not null check (consent_contact = true),
  consent_timestamp timestamptz not null,
  consent_text_version text not null,
  outcome text not null check (outcome in ('created', 'updated', 'name_mismatch', 'possible_duplicate')),
  request_fingerprint text check (request_fingerprint is null or request_fingerprint ~ '^[0-9a-f]{64}$'),
  submitted_at timestamptz not null default now()
);

alter table private.worker_connect_submissions enable row level security;
revoke all on table private.worker_connect_submissions from public, anon, authenticated;
create index if not exists worker_connect_submissions_worker_idx on private.worker_connect_submissions (worker_id, submitted_at desc);
create index if not exists worker_connect_submissions_phone_idx on private.worker_connect_submissions (phone_normalized, submitted_at desc);

create table if not exists private.worker_connect_rate_limits (
  key_hash text not null check (key_hash ~ '^[0-9a-f]{64}$'),
  bucket_start timestamptz not null,
  request_count integer not null default 1 check (request_count between 1 and 1000),
  expires_at timestamptz not null,
  primary key (key_hash, bucket_start)
);

alter table private.worker_connect_rate_limits enable row level security;
revoke all on table private.worker_connect_rate_limits from public, anon, authenticated;

create or replace function public.worker_connect_rate_limit(p_key_hash text, p_limit integer default 5)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_bucket timestamptz := date_bin('10 minutes', now(), '2020-01-01 00:00:00+00'::timestamptz);
  v_count integer;
begin
  if p_key_hash !~ '^[0-9a-f]{64}$' or p_limit < 1 or p_limit > 50 then
    return false;
  end if;
  insert into private.worker_connect_rate_limits (key_hash, bucket_start, request_count, expires_at)
  values (p_key_hash, v_bucket, 1, v_bucket + interval '30 minutes')
  on conflict (key_hash, bucket_start) do update
  set request_count = private.worker_connect_rate_limits.request_count + 1
  returning request_count into v_count;
  delete from private.worker_connect_rate_limits where expires_at < now();
  return v_count <= p_limit;
end;
$$;

revoke all on function public.worker_connect_rate_limit(text, integer) from public, anon, authenticated;
grant execute on function public.worker_connect_rate_limit(text, integer) to service_role;

create or replace function public.worker_connect_upsert(
  p_submission_id uuid,
  p_full_name text,
  p_full_name_normalized text,
  p_phone_raw text,
  p_phone_normalized text,
  p_phone_key text,
  p_postcode_raw text,
  p_postcode_normalized text,
  p_postcode_outward text,
  p_trades text[],
  p_other_trade text,
  p_source text,
  p_campaign jsonb,
  p_consent boolean,
  p_consent_version text,
  p_consent_timestamp timestamptz,
  p_request_fingerprint text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_worker public.yellow_workers%rowtype;
  v_worker_id bigint;
  v_existing_submission private.worker_connect_submissions%rowtype;
  v_created boolean := false;
  v_name_mismatch boolean := false;
  v_possible_duplicate boolean := false;
  v_outcome text;
begin
  select * into v_existing_submission
  from private.worker_connect_submissions
  where submission_id = p_submission_id;
  if found then
    return jsonb_build_object('ok', true, 'idempotent', true);
  end if;

  if p_consent is not true
    or p_phone_normalized !~ '^\+447[0-9]{9}$'
    or p_phone_key !~ '^7[0-9]{9}$'
    or cardinality(p_trades) not between 1 and 5
    or not (p_trades <@ array(select canonical_name from private.worker_connect_trades where is_active)) then
    raise exception 'invalid worker submission';
  end if;

  insert into public.yellow_workers (name, phone, phone_key, postcode, trade, source, updated_at)
  values (p_full_name, p_phone_normalized, p_phone_key, p_postcode_normalized, p_trades[1], p_source, now())
  on conflict (phone_key) do nothing
  returning * into v_worker;

  if found then
    v_created := true;
  else
    select * into v_worker from public.yellow_workers where phone_key = p_phone_key for update;
  end if;
  v_worker_id := v_worker.id;

  if not v_created and btrim(coalesce(v_worker.name, '')) <> '' then
    v_name_mismatch := regexp_replace(lower(btrim(v_worker.name)), '\\s+', ' ', 'g') <> p_full_name_normalized;
  end if;

  if v_created then
    select exists (
      select 1 from public.yellow_workers candidate
      where candidate.id <> v_worker_id
        and upper(replace(coalesce(candidate.postcode, ''), ' ', '')) = upper(replace(p_postcode_normalized, ' ', ''))
        and public.similarity(lower(coalesce(candidate.name, '')), lower(p_full_name)) >= 0.84
      limit 1
    ) into v_possible_duplicate;
  end if;

  if not v_created then
    update public.yellow_workers
    set postcode = p_postcode_normalized,
        source = p_source,
        updated_at = now()
    where id = v_worker_id;
  end if;

  v_outcome := case when v_name_mismatch then 'name_mismatch' when v_possible_duplicate then 'possible_duplicate' when v_created then 'created' else 'updated' end;

  insert into private.worker_connect_profiles (
    worker_id, full_name, full_name_normalized, phone_raw, phone_normalized,
    postcode_raw, postcode_normalized, postcode_outward, trades_canonical,
    other_trade_text, source, campaign, consent_contact, consent_timestamp,
    consent_text_version, duplicate_status, review_reason
  ) values (
    v_worker_id,
    case when v_name_mismatch then v_worker.name else p_full_name end,
    case when v_name_mismatch then regexp_replace(lower(btrim(v_worker.name)), '\\s+', ' ', 'g') else p_full_name_normalized end,
    p_phone_raw, p_phone_normalized, p_postcode_raw, p_postcode_normalized,
    p_postcode_outward, p_trades, nullif(p_other_trade, ''), p_source,
    coalesce(p_campaign, '{}'::jsonb), true, p_consent_timestamp,
    p_consent_version,
    case when v_name_mismatch then 'name_mismatch' when v_possible_duplicate then 'possible_duplicate' else 'clear' end,
    case when v_name_mismatch then 'Needs review — name mismatch' when v_possible_duplicate then 'Possible duplicate' else null end
  )
  on conflict (worker_id) do update set
    postcode_raw = excluded.postcode_raw,
    postcode_normalized = excluded.postcode_normalized,
    postcode_outward = excluded.postcode_outward,
    trades_canonical = array(select distinct x from unnest(private.worker_connect_profiles.trades_canonical || excluded.trades_canonical) x order by x),
    other_trade_text = coalesce(excluded.other_trade_text, private.worker_connect_profiles.other_trade_text),
    source = excluded.source,
    campaign = private.worker_connect_profiles.campaign || excluded.campaign,
    consent_contact = true,
    consent_timestamp = excluded.consent_timestamp,
    consent_text_version = excluded.consent_text_version,
    verification_status = 'Pending verification',
    duplicate_status = excluded.duplicate_status,
    review_reason = excluded.review_reason,
    last_submitted_at = now(),
    updated_at = now();

  insert into private.worker_connect_submissions (
    submission_id, worker_id, submitted_full_name, submitted_full_name_normalized,
    phone_normalized, submitted_postcode, submitted_trades, other_trade_text,
    source, campaign, consent_contact, consent_timestamp, consent_text_version,
    outcome, request_fingerprint
  ) values (
    p_submission_id, v_worker_id, p_full_name, p_full_name_normalized,
    p_phone_normalized, p_postcode_normalized, p_trades, nullif(p_other_trade, ''),
    p_source, coalesce(p_campaign, '{}'::jsonb), true, p_consent_timestamp,
    p_consent_version, v_outcome, p_request_fingerprint
  );

  return jsonb_build_object('ok', true, 'idempotent', false);
end;
$$;

revoke all on function public.worker_connect_upsert(uuid, text, text, text, text, text, text, text, text, text[], text, text, jsonb, boolean, text, timestamptz, text) from public, anon, authenticated;
grant execute on function public.worker_connect_upsert(uuid, text, text, text, text, text, text, text, text, text[], text, text, jsonb, boolean, text, timestamptz, text) to service_role;
