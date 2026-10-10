import React from "react";
import { Menu, Plus, RefreshCw, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle: string;
  onOpenSidebar: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onNewWorkOrder?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenSidebar,
  onRefresh,
  isRefreshing = false,
  onNewWorkOrder
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-[#1E2638] bg-[#090D14]/90 px-4 md:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1E2638] bg-[#121826] text-slate-300 hover:text-white lg:hidden cursor-pointer"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">
              {title}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-semibold text-sky-400 border border-sky-500/20">
              <Activity className="h-3 w-3" />
              Tempo Real
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="hidden sm:inline-flex h-9 text-xs gap-1.5"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-sky-400" : "text-slate-400"}`}
            />
            <span>Atualizar</span>
          </Button>
        )}

        {onNewWorkOrder && (
          <Button
            size="sm"
            onClick={onNewWorkOrder}
            className="h-9 px-3.5 text-xs font-semibold gap-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-md shadow-sky-500/20"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden xs:inline">Nova OS</span>
            <span className="xs:hidden">Nova OS</span>
          </Button>
        )}
      </div>
    </header>
  );
};
