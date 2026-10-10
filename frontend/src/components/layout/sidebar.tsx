import React from "react";
import {
  LayoutDashboard,
  Box as BoxIcon,
  ClipboardList,
  CalendarDays,
  Users,
  CarFront,
  Sparkles,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { useSidebarStore } from "@/stores/sidebar.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  active?: boolean;
}

const NAV_ITEMS: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Visão Geral",
    icon: LayoutDashboard,
    active: true
  },
  {
    id: "boxes",
    label: "Boxes em Tempo Real",
    icon: BoxIcon,
    badge: "3"
  },
  {
    id: "work-orders",
    label: "Ordens de Serviço",
    icon: ClipboardList
  },
  {
    id: "appointments",
    label: "Agendamentos",
    icon: CalendarDays
  },
  {
    id: "clients",
    label: "Clientes",
    icon: Users
  },
  {
    id: "vehicles",
    label: "Veículos",
    icon: CarFront
  },
  {
    id: "services",
    label: "Serviços & Preços",
    icon: Sparkles
  },
  {
    id: "notifications",
    label: "Notificações WhatsApp",
    icon: MessageSquare
  }
];

export function Sidebar() {
  const { collapsed, toggleCollapsed } = useSidebarStore();

  return (
    <aside
      className={cn(
        "relative hidden lg:flex flex-col border-r border-border bg-card/95 transition-all duration-300 z-30 select-none",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border/80 px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
            <Sparkles className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold tracking-tight text-foreground truncate">
                Bruno Lava Car
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground truncate">
                Estética & Lavagem
              </span>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
          aria-label={collapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-left cursor-pointer",
                item.active
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "text-muted-foreground hover:bg-card-hover hover:text-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform group-hover:scale-105",
                  item.active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <Badge
                  variant={item.active ? "secondary" : "default"}
                  className="ml-auto text-[10px] px-1.5 py-0"
                >
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      <div className="border-t border-border/80 p-4">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg bg-secondary/50 p-2.5 border border-border/50",
            collapsed && "justify-center p-2"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-foreground">API v1 Conectada</span>
              <span className="text-[10px] text-muted-foreground">Redis Locks & BullMQ</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
