# Worker Connect UK

Public worker-registration MVP for UK construction recruitment.

## Safety mode

The published UI defaults to `preview: true`. Inputs are disabled, examples are synthetic and no personal data is sent or stored. Do not enable live collection until all activation gates are complete.

## Activation gates

- Confirm the data controller/operator.
- Publish a real privacy contact and request route.
- Approve the retention period and deletion workflow.
- Replace the placeholder privacy page with reviewed legal copy.
- Configure `WORKER_CONNECT_HASH_PEPPER` for the Edge Function.
- Deploy the Edge Function with live mode enabled.
- Change `preview` to `false`, render the searchable trade selector and enable the controls.
- Run the full acceptance and mobile test suite.

## Architecture

- GitHub Pages: static form at `/worker-connect/`
- Supabase Edge Function: validation, abuse protection and generic responses
- `private.worker_connect_*`: consent, idempotency and audit records
- `public.yellow_workers`: existing central worker identity keyed by normalized phone

No secret or service-role key is present in browser code.
