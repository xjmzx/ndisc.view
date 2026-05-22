import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SignerProvider } from "./hooks/useSigner.tsx";
import { ReactionsProvider } from "./hooks/useReactions.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SignerProvider>
      <ReactionsProvider>
        <App />
      </ReactionsProvider>
    </SignerProvider>
  </StrictMode>,
);
