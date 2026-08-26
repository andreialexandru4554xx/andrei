(() => {
  'use strict';

  const OPEN_USER_ID = 'a0db658c-51a3-4574-a00f-76fb862fd2ec';
  const OPEN_USER = Object.freeze({
    id: OPEN_USER_ID,
    aud: 'authenticated',
    role: 'authenticated',
    email: 'acces-deschis@control-postari.local',
    phone: '',
    app_metadata: { provider: 'open-mode', providers: ['open-mode'] },
    user_metadata: { display_name: 'Andrei', open_mode: true },
    identities: [],
    created_at: '2026-08-26T00:00:00.000Z',
    updated_at: '2026-08-26T00:00:00.000Z',
    is_anonymous: false,
  });

  const OPEN_SESSION = Object.freeze({
    access_token: 'open-mode-local-session',
    refresh_token: '',
    token_type: 'bearer',
    expires_in: 315360000,
    expires_at: 2082758400,
    user: OPEN_USER,
  });

  const originalCreateClient = window.supabase?.createClient;
  if (typeof originalCreateClient !== 'function') return;

  window.supabase.createClient = function createOpenClient(url, key, options = {}) {
    const emptyStorage = {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    };

    const client = originalCreateClient(url, key, {
      ...options,
      auth: {
        ...(options.auth || {}),
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage: emptyStorage,
      },
    });

    client.auth.getSession = async () => ({ data: { session: OPEN_SESSION }, error: null });
    client.auth.getUser = async () => ({ data: { user: OPEN_USER }, error: null });
    client.auth.signOut = async () => ({ error: null });
    client.auth.onAuthStateChange = (callback) => {
      let active = true;
      const notify = () => {
        if (active) callback('SIGNED_IN', OPEN_SESSION);
      };
      if (typeof queueMicrotask === 'function') queueMicrotask(notify);
      else Promise.resolve().then(notify);
      return {
        data: {
          subscription: {
            unsubscribe() { active = false; },
          },
        },
        error: null,
      };
    };

    const originalRpc = client.rpc.bind(client);
    client.rpc = (name, args, rpcOptions) => {
      if (name === 'pc_import_legacy_posts') {
        return Promise.resolve({ data: { posts_inserted: 0 }, error: null });
      }
      return originalRpc(name, args, rpcOptions);
    };

    return client;
  };
})();
