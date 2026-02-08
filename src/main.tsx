import { createRoot } from "react-dom/client";
import { ConvexClientProvider } from "./components/ConvexClientProvider";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ConvexClientProvider>
    <App />
  </ConvexClientProvider>
);
