# Move-ON Árazás

Internal pricing tool for Move-ON: record finished moves, bulk-import them from Excel, and see how each
factor (floors, boxes, furniture, crew size…) affects working time and price.

Built with Vite + React. Implemented from the Claude Design file `Move-ON Árazás v10.1`.

## Run locally

```bash
npm install
npm run dev
```

## Data storage

- **Local mode** (default, no configuration): data and the login password stay in the browser's
  `localStorage`. Nothing is shared between devices.
- **Cloud mode**: set the Supabase variables below and the app uses Supabase Auth, Postgres and realtime sync.

| Variable | Meaning |
| --- | --- |
| `VITE_SUPABASE_URL` | Project URL, e.g. `https://abcdefgh.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | The public `anon` / publishable key. Never the `service_role` key. |
| `VITE_LOGIN_DOMAIN` | Optional. Bare usernames log in as `<name>@<domain>` (default `moveonkoltoztetes.hu`). |

These are read at **build time**, so redeploy after changing them.

To prepare a Supabase project: run `supabase/schema.sql` in the SQL editor, then create the shared company
user under Authentication → Users.

## Deploy on Railway

`railway.json` builds with `npm run build` and serves `dist/` with `npm start` on Railway's `$PORT`.
Create a project from this GitHub repo, add the variables above if you want cloud mode, and generate a domain.

## Layout

- `src/logic.js` – billing, validation, time model, storage back-ends, Excel parsing
- `src/App.jsx` – state, actions and the view-model
- `src/View.jsx` – markup
- `supabase/schema.sql` – tables and policies for cloud mode
