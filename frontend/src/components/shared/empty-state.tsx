import { Inbox, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className
}: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed border-border/60 bg-card/40", className)}>
      <CardContent className="flex flex-col items-center justify-center p-10 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Icon className="h-6 w-6" />
        </div>
        <h4 className="text-base font-medium text-foreground">{title}</h4>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
        {actionLabel && onAction && (
          <Button
            size="sm"
            onClick={onAction}
            className="mt-5"
          >
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
