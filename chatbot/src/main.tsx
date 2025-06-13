import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "./context/auth.tsx";
import "./index.css";
import RoutesDefined from "./RoutesDefined.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RoutesDefined />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
