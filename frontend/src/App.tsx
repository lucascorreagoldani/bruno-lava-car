import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardPage } from "@/pages/dashboard-page";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 2,
      refetchOnWindowFocus: true
    }
  }
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>
      <Toaster
        theme="dark"
        position="top-right"
        richColors
        closeButton
      />
    </QueryClientProvider>
  );
}

export default App;
