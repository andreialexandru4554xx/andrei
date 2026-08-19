# Andrei Business World 3D

A browser-based 3D business operating system prototype: a visual HQ where departments, systems and live company KPIs can be explored spatially.

## V2 included

- Interactive 3D HQ with Blue, Yellow, Red and Control Room departments
- Central glass atrium / data core
- Office interiors: desks, monitors, agent figures, wall displays
- Server racks / operational infrastructure
- Clickable departments with animated camera focus
- Global and per-department KPI panels
- Data-system status panel
- Mock data isolated in `src/data.js`
- Supabase integration boundary in `src/supabase-adapter.js`
- No build step required

## Run locally

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

## Architecture

- `index.html` — app shell and import map
- `styles.css` — dashboard UI
- `src/main.js` — Three.js HQ, office interiors and interactions
- `src/data.js` — business model / demo KPIs
- `src/supabase-adapter.js` — safe boundary for future live data

## Live data

Use Supabase through a safe API or Edge Function for aggregate KPI queries. Never expose a Supabase service-role key in browser code.
