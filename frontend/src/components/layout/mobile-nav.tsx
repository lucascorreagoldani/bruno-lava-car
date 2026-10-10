import {
  LayoutDashboard,
  Box as BoxIcon,
  ClipboardList,
  CalendarDays,
  Users,
  CarFront,
  Sparkles,
  MessageSquare,
  X
} from "lucide-react";
import { useSidebarStore } from "@/stores/sidebar.store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const { mobileOpen, setMobileOpen } = useSidebarStore();

  if (!mobileOpen) {
    return null;
  }

  const navItems = [
    { id: "dashboard", label: "Visão Geral", icon: LayoutDashboard, active: true },
    { id: "boxes", label: "Boxes em Tempo Real", icon: BoxIcon },
    { id: "work-orders", label: "Ordens de Serviço", icon: ClipboardList },
    { id: "appointments", label: "Agendamentos", icon: CalendarDays },
    { id: "clients", label: "Clientes", icon: Users },
    { id: "vehicles", label: "Veículos", icon: CarFront },
    { id: "services", label: "Serviços & Preços", icon: Sparkles },
    { id: "notifications", label: "Notificações WhatsApp", icon: MessageSquare }
  ];

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setMobileOpen(false)}
      />
      <div className="relative flex w-full max-w-xs flex-1 flex-col bg-card border-r border-border p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Bruno Lava Car</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Centro Automotivo
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="h-8 w-8 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="mt-4 flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left",
                  item.active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-card-hover hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
