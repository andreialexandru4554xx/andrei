#!/usr/bin/env python3
from __future__ import annotations

import sys
from pathlib import Path

CACHE_TAG = "20260826-photo1"
SUPABASE_IMPORT = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.4/+esm"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected 1 match, found {count}")
    return text.replace(old, new, 1)


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: enable-guest-ui.py <index.html>")

    path = Path(sys.argv[1]).resolve()
    html = path.read_text(encoding="utf-8")
    html = replace_once(
        html,
        '<link rel="stylesheet" href="./styles.css" />',
        f'<link rel="stylesheet" href="./styles.css?v={CACHE_TAG}" />\n'
        f'  <link rel="stylesheet" href="./photo-upload.css?v={CACHE_TAG}" />\n'
        '  <style id="guest-ui-style">#usersNavItem,#logoutButton{display:none!important}</style>',
        "stylesheet marker",
    )
    html = replace_once(
        html,
        '<section id="authView" class="auth-view">',
        '<section id="authView" class="auth-view hidden">',
        "login view",
    )
    html = replace_once(
        html,
        '<section id="appView" class="app-view hidden">',
        '<section id="appView" class="app-view">',
        "application view",
    )
    html = replace_once(
        html,
        '<div class="live-pill"><span class="pulse-dot"></span><span>Live</span></div>',
        '<div class="live-pill" title="Intrare directă, fără cont sau parolă"><span>🔓</span><span>Acces deschis</span></div>',
        "direct-access badge",
    )
    html = replace_once(
        html,
        '<div><strong>Sistem reconectat</strong><small>Datele sunt salvate securizat în Supabase</small></div>',
        '<div><strong>Mod deschis temporar</strong><small>Datele rămân sincronizate în baza comună</small></div>',
        "status copy",
    )
    module_tag = '<script type="module" src="./app.js"></script>'
    import_map = (
        '<script type="importmap">\n'
        '    {"imports":{"' + SUPABASE_IMPORT + '":"./guest-supabase.js?v=' + CACHE_TAG + '"}}\n'
        '  </script>\n'
        f'  <script type="module" src="./photo-upload.js?v={CACHE_TAG}"></script>\n'
        f'  <script type="module" src="./app.js?v={CACHE_TAG}"></script>'
    )
    html = replace_once(html, module_tag, import_map, "application module")

    if (
        "Acces deschis" not in html
        or "guest-supabase.js" not in html
        or "photo-upload.js" not in html
        or "photo-upload.css" not in html
    ):
        raise RuntimeError("guest/photo UI markers are missing")
    path.write_text(html, encoding="utf-8")
    print(f"Enabled temporary guest UI and photo upload in {path}")


if __name__ == "__main__":
    main()
