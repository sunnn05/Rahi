import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.jsx";
import "./index.css";

// Registers the service worker vite-plugin-pwa generates at build time.
// This import only resolves during `vite build` / `vite preview` — during
// plain `npm run dev` there is no service worker, which is normal and fine:
// offline support is something you test against a production build.
registerSW({ immediate: true });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
