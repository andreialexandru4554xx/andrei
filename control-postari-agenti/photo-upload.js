import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.4/+esm';

const SUPABASE_URL = 'https://lmztoiikbgcaeztdweov.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_hNcUMCduD_AAjBTgJvjqfg_BNJOLk6Z';
const PHOTO_BUCKET = 'control-postari-dovezi';
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]);

const photoClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

let activeObjectUrl = '';

function revokeObjectUrl() {
  if (!activeObjectUrl) return;
  URL.revokeObjectURL(activeObjectUrl);
  activeObjectUrl = '';
}

function humanFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 MB';
  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 1 : 2)} MB`;
}

function isHttpUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return false;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function inferredMimeType(file) {
  if (file.type) return file.type.toLowerCase();
  const extension = String(file.name || '').split('.').pop()?.toLowerCase();
  const map = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    heic: 'image/heic',
    heif: 'image/heif',
  };
  return map[extension] || '';
}

function extensionForFile(file) {
  const mime = inferredMimeType(file);
  const mimeMap = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/heic': 'heic',
    'image/heif': 'heif',
  };
  if (mimeMap[mime]) return mimeMap[mime];
  const extension = String(file.name || '').split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '');
  return extension && extension.length <= 5 ? extension : 'jpg';
}

function validatePhoto(file) {
  if (!file) return '';
  const mime = inferredMimeType(file);
  if (!ACCEPTED_MIME_TYPES.has(mime)) {
    return 'Poza trebuie să fie JPG, PNG, WEBP, GIF, HEIC sau HEIF.';
  }
  if (file.size > MAX_FILE_BYTES) {
    return `Poza este prea mare (${humanFileSize(file.size)}). Limita este 15 MB.`;
  }
  return '';
}

function buildStoragePath(file) {
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const random = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  return `proofs/${year}/${month}/${Date.now()}-${random}.${extensionForFile(file)}`;
}

function getMessageElement(form) {
  return form.querySelector('#modalFormMessage');
}

function setFormMessage(form, text = '', type = '') {
  const element = getMessageElement(form);
  if (!element) return;
  element.textContent = text;
  element.classList.remove('error', 'success');
  if (type) element.classList.add(type);
}

function setUploadBusy(form, busy) {
  const submit = form.querySelector('button[type="submit"]');
  const choose = form.querySelector('[data-photo-action="choose"]');
  const remove = form.querySelector('[data-photo-action="remove"]');
  const fileInput = form.querySelector('[data-photo-file]');

  if (submit) {
    if (busy) {
      if (!submit.dataset.photoOriginalHtml) submit.dataset.photoOriginalHtml = submit.innerHTML;
      submit.disabled = true;
      submit.textContent = 'Se încarcă poza...';
    } else {
      submit.disabled = false;
      if (submit.dataset.photoOriginalHtml) {
        submit.innerHTML = submit.dataset.photoOriginalHtml;
        delete submit.dataset.photoOriginalHtml;
      }
    }
  }
  if (choose) choose.disabled = busy;
  if (remove) remove.disabled = busy;
  if (fileInput) fileInput.disabled = busy;
}

function renderPhotoPreview(form, { file = null, url = '', error = '' } = {}) {
  const card = form.querySelector('[data-photo-upload]');
  if (!card) return;
  const preview = card.querySelector('[data-photo-preview]');
  const image = card.querySelector('[data-photo-image]');
  const placeholder = card.querySelector('[data-photo-placeholder]');
  const meta = card.querySelector('[data-photo-meta]');
  const remove = card.querySelector('[data-photo-action="remove"]');

  revokeObjectUrl();
  let source = '';
  if (file) {
    activeObjectUrl = URL.createObjectURL(file);
    source = activeObjectUrl;
  } else if (isHttpUrl(url)) {
    source = url;
  }

  if (source) {
    image.src = source;
    image.alt = file ? `Previzualizare ${file.name || 'poză'}` : 'Previzualizare dovadă';
    image.classList.remove('hidden');
    placeholder.classList.add('hidden');
    preview.classList.add('has-image');
    remove.classList.remove('hidden');
  } else {
    image.removeAttribute('src');
    image.classList.add('hidden');
    placeholder.classList.remove('hidden');
    preview.classList.remove('has-image');
    remove.classList.add('hidden');
  }

  card.classList.toggle('has-error', Boolean(error));
  if (error) meta.textContent = error;
  else if (file) meta.textContent = `${file.name || 'Imagine'} · ${humanFileSize(file.size)}`;
  else if (source) meta.textContent = 'Poză salvată deja pentru această postare.';
  else meta.textContent = 'JPG, PNG, WEBP, GIF sau HEIC · maximum 15 MB';
}

function enhancePostForm(form) {
  if (!form || form.dataset.photoUploadEnhanced === '1') return;
  const proofInput = form.querySelector('input[name="proof_url"]');
  const proofField = proofInput?.closest('.field');
  if (!proofInput || !proofField) return;

  form.dataset.photoUploadEnhanced = '1';
  proofField.querySelector('span').textContent = 'Link dovadă / captură (opțional)';

  const card = document.createElement('section');
  card.className = 'photo-upload-card span-2';
  card.dataset.photoUpload = '1';
  card.innerHTML = `
    <div class="photo-upload-copy">
      <span class="photo-upload-label">📷 Încarcă poză</span>
      <strong>Dovada postării, direct din telefon</strong>
      <small data-photo-meta>JPG, PNG, WEBP, GIF sau HEIC · maximum 15 MB</small>
      <div class="photo-upload-actions">
        <button class="button button-secondary button-small" data-photo-action="choose" type="button">＋ Alege poză</button>
        <button class="button button-small photo-remove hidden" data-photo-action="remove" type="button">Elimină poza</button>
      </div>
      <input class="photo-file-input" data-photo-file type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/*" />
    </div>
    <button class="photo-upload-preview" data-photo-action="choose" data-photo-preview type="button" aria-label="Alege o poză">
      <span data-photo-placeholder>＋<small>POZĂ</small></span>
      <img class="hidden" data-photo-image alt="" />
    </button>
  `;
  proofField.insertAdjacentElement('afterend', card);

  const fileInput = card.querySelector('[data-photo-file]');
  const chooseButtons = card.querySelectorAll('[data-photo-action="choose"]');
  const removeButton = card.querySelector('[data-photo-action="remove"]');

  chooseButtons.forEach((button) => button.addEventListener('click', () => fileInput.click()));
  fileInput.addEventListener('change', () => {
    delete form.dataset.photoUploadReady;
    const file = fileInput.files?.[0] || null;
    const error = validatePhoto(file);
    renderPhotoPreview(form, { file, error });
    setFormMessage(form, error, error ? 'error' : '');
  });

  removeButton.addEventListener('click', () => {
    fileInput.value = '';
    proofInput.value = '';
    delete form.dataset.photoUploadReady;
    renderPhotoPreview(form);
    setFormMessage(form);
  });

  proofInput.addEventListener('input', () => {
    if (fileInput.files?.length) return;
    renderPhotoPreview(form, { url: proofInput.value });
  });

  renderPhotoPreview(form, { url: proofInput.value });
}

async function uploadSelectedPhoto(form, file) {
  const path = buildStoragePath(file);
  const contentType = inferredMimeType(file);
  const { error } = await photoClient.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, {
      cacheControl: '31536000',
      contentType,
      upsert: false,
    });
  if (error) throw error;

  const { data } = photoClient.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  const publicUrl = data?.publicUrl || '';
  if (!isHttpUrl(publicUrl)) throw new Error('Nu s-a putut genera linkul public al pozei.');
  return publicUrl;
}

function friendlyUploadError(error) {
  const message = String(error?.message || error || '').trim();
  if (/payload too large|entity too large|maximum.*size|file.*large/i.test(message)) {
    return 'Poza este prea mare. Alege o imagine de maximum 15 MB.';
  }
  if (/mime|content.?type|invalid.*type/i.test(message)) {
    return 'Formatul pozei nu este acceptat. Folosește JPG, PNG, WEBP, GIF sau HEIC.';
  }
  if (/row-level security|policy|permission|unauthorized|forbidden/i.test(message)) {
    return 'Încărcarea nu are încă permisiune în baza de date. Reîncarcă pagina și încearcă din nou.';
  }
  return message || 'Poza nu s-a putut încărca.';
}

async function interceptPostSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || form.id !== 'postForm') return;
  if (form.dataset.photoUploadReady === '1') return;

  const fileInput = form.querySelector('[data-photo-file]');
  const file = fileInput?.files?.[0];
  if (!file) return;

  const postUrl = String(form.querySelector('input[name="post_url"]')?.value || '').trim();
  if (postUrl && !isHttpUrl(postUrl)) return;

  event.preventDefault();
  event.stopImmediatePropagation();

  const validationError = validatePhoto(file);
  if (validationError) {
    setFormMessage(form, validationError, 'error');
    renderPhotoPreview(form, { file, error: validationError });
    return;
  }

  setUploadBusy(form, true);
  setFormMessage(form, 'Se încarcă poza în baza comună...');
  try {
    const publicUrl = await uploadSelectedPhoto(form, file);
    const proofInput = form.querySelector('input[name="proof_url"]');
    proofInput.value = publicUrl;
    proofInput.dispatchEvent(new Event('input', { bubbles: true }));
    form.dataset.photoUploadReady = '1';
    setFormMessage(form, 'Poza a fost încărcată. Se salvează postarea...', 'success');
    setUploadBusy(form, false);
    const submit = form.querySelector('button[type="submit"]');
    form.requestSubmit(submit || undefined);
  } catch (error) {
    setUploadBusy(form, false);
    setFormMessage(form, friendlyUploadError(error), 'error');
  }
}

function scanForPostForm() {
  enhancePostForm(document.querySelector('#postForm'));
}

const observer = new MutationObserver(() => {
  scanForPostForm();
  if (!document.querySelector('#postForm')) revokeObjectUrl();
});

observer.observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener('submit', interceptPostSubmit, true);
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scanForPostForm, { once: true });
else scanForPostForm();
