import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ProblemDetail } from "@/types/api";

interface ErrorStateProps {
  title?: string;
  message?: string;
  problemDetail?: ProblemDetail;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Falha ao carregar dados",
  message = "Ocorreu um erro ao comunicar com os servidores do Bruno Lava Car.",
  problemDetail,
  onRetry,
  className
}: ErrorStateProps) {
  const displayMessage = problemDetail?.detail || message;
  const statusNumber = problemDetail?.status;

  return (
    <Card className={cn("border-rose-900/50 bg-rose-950/20", className)}>
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h4 className="text-base font-semibold text-foreground">{title}</h4>
        <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
          {displayMessage}
        </p>
        {statusNumber && (
          <span className="mt-2 font-mono text-xs text-rose-400">
            Código HTTP: {statusNumber}
          </span>
        )}
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-5 gap-2 border-rose-800/60 hover:bg-rose-900/30 text-rose-200"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Tentar novamente
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
