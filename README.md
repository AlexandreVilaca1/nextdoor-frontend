<<<<<<< Updated upstream
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
=======
# NextDoor Frontend

This project contains the frontend of the NextDoor application: a neighbourhood platform where
users publish tasks, earn points by helping their neighbours and redeem those points for
products from partner establishments.

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/AlexandreVilaca1/nextodoor-frontend.git
cd nextodoor-frontend
```

### 2. Start the Backend

This app consumes the API at `http://localhost:3000`, so the backend has to be running first
(see [nextdoor-backend](https://github.com/AlexandreVilaca1/nextdoor-backend)).

> ⚠️ The API address is fixed in `http://localhost:3000` inside the `*Service.tsx` files. The
> backend CORS only allows the origin `http://localhost:5173`, which is the default `vite dev`
> port.

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

- Authentication uses the JWT returned by the backend, stored in the `jwt` cookie and sent with
  every request.
- There are no automated tests; the check is the TypeScript build (`npm run build`).
- `npm run lint` still reports issues inherited from the original code (mostly `no-explicit-any`
  and unused variables).
- This setup is intended for local development.
>>>>>>> Stashed changes
