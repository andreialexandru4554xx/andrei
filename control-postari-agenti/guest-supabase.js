import { createClient as createBaseClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.4/+esm?guest-runtime=1';

const GUEST_ID = '29658e3f-b82c-428d-8b9f-b2a535e21082';
const GUEST_USER = Object.freeze({
  id: GUEST_ID,
  aud: 'authenticated',
  role: 'authenticated',
  email: null,
  phone: null,
  app_metadata: Object.freeze({ provider: 'open_guest', providers: ['open_guest'] }),
  user_metadata: Object.freeze({ display_name: 'Acces deschis' }),
  identities: [],
  is_anonymous: true,
});
const GUEST_SESSION = Object.freeze({ user: GUEST_USER });
const EMPTY_STORAGE = Object.freeze({
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
});

export function createClient(url, key, options = {}) {
  const client = createBaseClient(url, key, {
    ...options,
    auth: {
      ...(options.auth || {}),
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: EMPTY_STORAGE,
    },
  });

  client.auth.getSession = async () => ({ data: { session: GUEST_SESSION }, error: null });
  client.auth.getUser = async () => ({ data: { user: GUEST_USER }, error: null });
  client.auth.signOut = async () => ({ error: null });
  client.auth.onAuthStateChange = () => ({
    data: { subscription: { unsubscribe() {} } },
    error: null,
  });

  return client;
}
