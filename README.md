# NextDoor frontend

The web client for NextDoor. Residents publish and browse neighbourhood tasks, earn points for the
help they give and spend them in the partner store; administrators manage users, products,
establishments and redemption codes from a dashboard.

It is a React 19 single-page app built with Vite 6 and TypeScript, styled with Tailwind CSS 4.
Routing uses react-router-dom 7, the HTTP calls mix `fetch` with `axios`, charts use recharts, and
the session token lives in a `jwt` cookie handled by js-cookie.

## Running it locally

The API is a separate repository — [nextdoor-backend](https://github.com/AlexandreVilaca1/nextdoor-backend).
Start it first: by default it listens on port 3000 and only accepts requests originating from
`http://localhost:5173`.

```bash
npm ci
npm run dev      # http://localhost:5173
```

If the backend is not on `localhost:3000`, point the app at it from an environment file:

```bash
cp .env.example .env    # then set VITE_API_URL
```

`VITE_API_URL` is optional; without it the app falls back to `http://localhost:3000`, so a fresh
clone runs with no configuration. Values prefixed with `VITE_` are compiled into the bundle and
are therefore public.

To produce a deployable build run `npm run build` (`tsc -b` followed by `vite build`, output in
`dist/`) and serve the result with `npm run preview`.

## Where things live

Routes are declared in `App.tsx`. Shared components are under `components/`, the administration
dashboard under `components/dashboard/` and the user area under `pages/User/`. Each domain — task
creation, task realisation, notifications, neighbourhoods, business processes — has its own folder
under `features/`, holding its list, cards, modals and the service module that talks to the API.
The 401, 403, 404, 500 and 503 screens are in `pages/Error/`.

The single configuration module is `src/config/api.ts`, which reads `VITE_API_URL`.

## Session

Login returns a JWT which is stored in the `jwt` cookie for one hour. The service modules read that
cookie and send it as `Authorization: Bearer <token>`; the backend validates it on every protected
route and answers 401 when the token is missing and 403 when it is invalid.

## Things worth knowing

- `auth/privateRoute.tsx` exists but is not wired into `App.tsx`, so the client does not block any
  route. Access control is the backend's job: opening `/admin` without a session renders an empty
  page because every request fails with 401.
- There are no automated tests; the safety net is the TypeScript build.

## Credits

Built by group G07PL for the PDS course at IPCA: João Paulo Carvalho
([@carvalhojp26](https://github.com/carvalhojp26)), Pedro Alves, David Pinheiro and Alexandre Vilaça
([@AlexandreVilaca1](https://github.com/AlexandreVilaca1)).

The original repository is `carvalhojp26/nextodoor-frontend`; its history ends with the 2025
delivery. The dashboard, user area and error pages were finished afterwards on a local copy that was
never pushed, so this is where they are published. This repository also fixes the build errors and
moves the API URL to `src/config/api.ts`.

MIT licensed, see [LICENSE](LICENSE). Copyright (c) 2025 João Paulo Carvalho.
