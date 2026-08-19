# RecruitFlow Business Tower 3D

A browser-based 3D business simulation that explains the company's operating model through a ten-floor interactive tower.

## Public experience

The public site uses aggregate metrics, role descriptions and anonymised agent IDs. It intentionally excludes phone numbers, emails, exact addresses, private URLs, credentials and identifiable operational records.

## Ten floors

1. Welcome & Business Map
2. Teams & Roles
3. Calls & AI Intelligence
4. Recruitment Apps Lab
5. Worker Database & Data Quality
6. Jobs & Matching Engine
7. First, Companies & Recovery
8. Education, Onboarding & QA
9. Internet Sourcing & Growth
10. Management, Control & Opportunities

## Interactive features

- Full ten-floor Three.js tower
- Elevator-style floor navigation
- Clickable 3D floors and animated camera movement
- Automatic guided tour
- Visitor XP, levels and business missions
- Career map with ten operational roles
- Product map covering Blue, Yellow, RED, IZA, Job Board, Dialpad AI and management tools
- Per-floor workflows, metrics, responsibilities and systems
- 78 anonymised team positions in the Teams floor
- Mobile-responsive UI and performance-aware floor visibility

## Aggregate snapshot represented

- 78 internal positions modelled
- 5 active teams
- 71,779 verified phone-format records in the latest known test snapshot
- approximately 23,000 records in the Yellow dataset snapshot
- 109 job postings
- 50 unique job contacts
- 15 tracked sourcing sources
- 25 confirmed companies
- 22 tracked offers

These values are operational snapshots, not live guarantees. Live values should be loaded only through a safe aggregate API.

## Run locally

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

## Architecture

- `index.html` — application shell, elevator UI, tour and information drawers
- `styles.css` — responsive glass-dashboard design
- `src/main.js` — Three.js tower, floor scenes, interactions, missions and tour logic
- `src/data.js` — public aggregate business model, floor descriptions, roles and applications
- `src/supabase-adapter.js` — reserved boundary for future aggregate live data

## Live-data rule

Use a protected API or Supabase Edge Function returning aggregate values only. Never expose a Supabase service-role key or private worker/company records in browser code.
