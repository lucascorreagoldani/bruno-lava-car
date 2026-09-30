import React from "react";
import { AlertCircle, RefreshCw, FolderOpen, Loader2 } from "lucide-react";

export interface DataStateWrapperProps<T> {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  data?: T[] | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
  children: (items: T[]) => React.ReactNode;
}

export function DataStateWrapper<T>({
  isLoading,
  isError,
  error,
  data,
  onRetry,
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription = "Não existem itens cadastrados ou correspondentes aos filtros aplicados.",
  onEmptyAction,
  emptyActionLabel = "Cadastrar Novo",
  children
}: DataStateWrapperProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full space-y-4 animate-pulse p-4">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" strokeWidth={1.75} />
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">
          Ocorreu uma falha ao carregar as informações
        </h3>
        <p className="text-sm text-red-700 dark:text-red-400 mt-1 max-w-md">
          {error?.message || "Erro desconhecido ao comunicar com o servidor."}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={1.75} />
            Tentar Novamente
          </button>
        )}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <FolderOpen className="w-8 h-8 text-slate-400" strokeWidth={1.75} />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
          {emptyTitle}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          {emptyDescription}
        </p>
        {onEmptyAction && (
          <button
            type="button"
            onClick={onEmptyAction}
            className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm min-h-[44px]"
          >
            {emptyActionLabel}
          </button>
        )}
      </div>
    );
  }

  return <>{children(data)}</>;
}
