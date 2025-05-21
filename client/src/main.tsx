import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { SidebarProvider } from "@/hooks/use-sidebar";

createRoot(document.getElementById("root")!).render(
  <SidebarProvider>
    <App />
  </SidebarProvider>
);
