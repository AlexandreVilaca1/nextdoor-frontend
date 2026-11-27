# NextDoor Frontend

This project contains the frontend of the NextDoor application: a neighbourhood platform where
users publish tasks, earn points by helping their neighbours and redeem those points for
products from partner establishments.

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/AlexandreVilaca1/nextdoor-frontend.git
cd nextdoor-frontend
```

### 2. Start the Backend

This app consumes the API at `http://localhost:3000`, so the backend has to be running first
(see [nextdoor-backend](https://github.com/AlexandreVilaca1/nextdoor-backend)).

The base URL comes from `VITE_API_URL` and, when it is not set, the app falls back to
`http://localhost:3000` — a fresh clone runs with `npm run dev` and no setup. To point it
somewhere else:

```bash
cp .env.example .env     # then edit VITE_API_URL
```

> ⚠️ `VITE_*` values are compiled into the bundle, so they are public: never put secrets in
> `.env`. The backend CORS only allows the origin `http://localhost:5173`, which is the default
> `vite dev` port.

### 3. Install Dependencies

```bash
npm ci
```

### 4. Run the Project

```bash
npm run dev
```

The app is served on `http://localhost:5173`.

### 5. Build

```bash
npm run build     # tsc -b && vite build -> dist/
npm run preview   # serves the production build
```

---

## ✅ Notes

- Authentication uses the JWT returned by the backend: it is stored in the `jwt` cookie at login
  (1 hour) and sent as `Authorization: Bearer <token>` on the API calls.
- There are no automated tests; the check is the TypeScript build (`npm run build`).
- `npm run lint` still reports issues inherited from the original code (mostly `no-explicit-any`
  and unused variables).
- This setup is intended for local development.
