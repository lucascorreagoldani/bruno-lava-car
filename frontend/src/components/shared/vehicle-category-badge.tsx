import React from "react";
import { Car, Truck, Bike } from "lucide-react";
import type { VehicleCategory } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VehicleCategoryBadgeProps {
  category: VehicleCategory;
  className?: string;
  showIcon?: boolean;
}

const CATEGORY_MAP: Record<
  VehicleCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; variant: "default" | "secondary" | "info" | "purple" }
> = {
  HATCH_COMPACTO: {
    label: "Hatch",
    icon: Car,
    variant: "secondary"
  },
  SEDAN_MEDIO: {
    label: "Sedan",
    icon: Car,
    variant: "info"
  },
  SUV_CROSSOVER: {
    label: "SUV",
    icon: Car,
    variant: "purple"
  },
  PICKUP_GRANDE: {
    label: "Picape",
    icon: Truck,
    variant: "default"
  },
  MOTO: {
    label: "Moto",
    icon: Bike,
    variant: "secondary"
  }
};

export function VehicleCategoryBadge({
  category,
  className,
  showIcon = true
}: VehicleCategoryBadgeProps) {
  const config = CATEGORY_MAP[category] || {
    label: category,
    icon: Car,
    variant: "secondary"
  };

  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn("gap-1.5 font-medium", className)}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      <span>{config.label}</span>
    </Badge>
  );
}
