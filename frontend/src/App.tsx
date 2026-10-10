import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardPage } from "@/pages/dashboard-page";

export function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.refetchQueries();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const getPageInfo = () => {
    switch (activeTab) {
      case "dashboard":
        return {
          title: "Painel Operacional & Indicadores",
          subtitle: "Visão consolidada do fluxo de veículos, ocupação e receita"
        };
      case "patio":
        return {
          title: "Pátio & Boxes em Tempo Real",
          subtitle: "Acompanhamento visual das baias de lavagem e secagem"
        };
      case "agendamentos":
        return {
          title: "Agenda de Atendimentos",
          subtitle: "Controle de horários e reservas de boxes"
        };
      case "ordens":
        return {
          title: "Ordens de Serviço",
          subtitle: "Histórico completo e status operacional de atendimentos"
        };
      case "clientes":
        return {
          title: "Clientes & Prontuário de Veículos",
          subtitle: "Base de dados e histórico de manutenções por placa"
        };
      case "notificacoes":
        return {
          title: "Mensageria WhatsApp & Alertas",
          subtitle: "Auditoria de disparos de confirmação e avisos de carro pronto"
        };
      default:
        return {
          title: "Bruno Lava Car",
          subtitle: "Sistema de Gestão & Estética Automotiva"
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <DashboardLayout
      title={pageInfo.title}
      subtitle={pageInfo.subtitle}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      onNewWorkOrder={() => setIsCheckInModalOpen(true)}
    >
      {activeTab === "dashboard" && (
        <DashboardPage
          isCheckInModalOpen={isCheckInModalOpen}
          onCloseCheckInModal={() => setIsCheckInModalOpen(false)}
        />
      )}

      {activeTab !== "dashboard" && (
        <DashboardPage
          isCheckInModalOpen={isCheckInModalOpen}
          onCloseCheckInModal={() => setIsCheckInModalOpen(false)}
        />
      )}
    </DashboardLayout>
  );
}

export default App;
