import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 2,
      refetchOnWindowFocus: true
    }
  }
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Elemento raiz #root não foi localizado no documento.");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        <App />
        <Toaster
          position="top-right"
          theme="dark"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: "#121826",
              border: "1px solid #1E2638",
              color: "#F8FAFC"
            }
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>
);
