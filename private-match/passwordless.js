(() => {
  const form = document.querySelector('#loginForm');
  const email = document.querySelector('#email');
  const msg = document.querySelector('#loginMsg');
  if (!form || !email || !msg) return;

  form.onsubmit = async (ev) => {
    ev.preventDefault();
    msg.textContent = 'Trimit linkul de acces...';
    const address = email.value.trim();
    const { error } = await s.auth.signInWithOtp({
      email: address,
      options: { emailRedirectTo: location.origin + location.pathname }
    });
    msg.textContent = error
      ? error.message
      : 'Link trimis. Deschide emailul și apasă linkul; apoi aplicația te ține autentificat.';
  };
})();