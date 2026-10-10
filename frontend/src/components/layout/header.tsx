import { useEffect, useRef } from "react";
import { Menu, Search, X } from "lucide-react";
import { useSidebarStore } from "@/stores/sidebar.store";
import { useDashboardFilterStore, type DatePeriod } from "@/stores/dashboard-filter.store";
import { useBoxesQuery } from "@/services/queries/use-boxes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const { setMobileOpen } = useSidebarStore();
  const { searchTerm, setSearchTerm, datePeriod, setDatePeriod } = useDashboardFilterStore();
  const { data: boxesData } = useBoxesQuery();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const boxes = boxesData?.data || [];
  const activeBoxes = boxes.filter((b) => b.status === "ACTIVE");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const periods: Array<{ id: DatePeriod; label: string }> = [
    { id: "TODAY", label: "Hoje" },
    { id: "YESTERDAY", label: "Ontem" },
    { id: "LAST_7_DAYS", label: "7 Dias" },
    { id: "MONTH", label: "Mês" }
  ];

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-card/80 px-4 md:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden h-9 w-9 text-muted-foreground"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden sm:flex items-center gap-2 rounded-full border border-border/80 bg-secondary/40 px-3 py-1">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-muted-foreground">
            {activeBoxes.length > 0
              ? `${activeBoxes.length} Boxes operando`
              : "Monitorando Boxes"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por placa, cliente ou OS... (Ctrl+K)"
            className="h-9 w-full rounded-lg border border-border bg-secondary/50 pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Limpar busca"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center rounded-lg border border-border bg-secondary/30 p-1">
          {periods.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setDatePeriod(p.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                datePeriod === p.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 border-l border-border/80 pl-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/30 font-semibold text-xs">
            BL
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-semibold text-foreground leading-tight">
              Bruno Lava Car
            </span>
            <span className="text-[10px] text-muted-foreground">
              Administrador
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
