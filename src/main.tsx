import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { seedDemoAuth } from "@/lib/demoAuthStorage";
import "./index.css";

seedDemoAuth();

createRoot(document.getElementById("root")!).render(<App />);
