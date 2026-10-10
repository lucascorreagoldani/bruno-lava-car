import React from "react";
import {
  LayoutDashboard,
  Columns3,
  Calendar,
  ClipboardList,
  Users,
  MessageSquare,
  CarFront,
  Sparkles,
  Server,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard Geral",
    icon: LayoutDashboard,
    badge: null
  },
  {
    id: "patio",
    label: "Pátio & Boxes",
    icon: Columns3,
    badge: "Ao Vivo"
  },
  {
    id: "agendamentos",
    label: "Agendamentos",
    icon: Calendar,
    badge: null
  },
  {
    id: "ordens",
    label: "Ordens de Serviço",
    icon: ClipboardList,
    badge: null
  },
  {
    id: "clientes",
    label: "Clientes & Veículos",
    icon: Users,
    badge: null
  },
  {
    id: "notificacoes",
    label: "Mensageria WhatsApp",
    icon: MessageSquare,
    badge: null
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen,
  onClose
}) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-[#1E2638] bg-[#0C111C] transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-18 items-center gap-3 border-b border-[#1E2638] px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20">
            <CarFront className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-white">
                Bruno Lava Car
              </span>
              <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            </div>
            <span className="text-xs font-medium text-slate-400">
              Gestão & Estética Automotiva
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-4 py-6">
          <nav className="space-y-1.5">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Menu Principal
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onTabChange(item.id);
                    onClose();
                  }}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer",
                    isActive
                      ? "bg-sky-500/15 text-sky-400 shadow-sm border border-sky-500/30"
                      : "text-slate-400 hover:bg-[#121826] hover:text-slate-200 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "h-4.5 w-4.5 transition-colors",
                        isActive ? "text-sky-400" : "text-slate-400 group-hover:text-slate-200"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="h-4 w-4 text-sky-400/60" />
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 space-y-3">
            <div className="rounded-xl border border-[#1E2638] bg-[#121826] p-4">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Server className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Servidor de Produção</span>
                </div>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                API RESTful v1 operacional com BullMQ e Redis conectados.
              </p>
              <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-[#1E2638]">
                <span>205.209.118.46</span>
                <span className="text-emerald-400 font-semibold">SSL Ativo</span>
              </div>
            </div>

            <div className="text-center text-[11px] text-slate-400 py-1">
              Bruno Lava Car © 2026
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
