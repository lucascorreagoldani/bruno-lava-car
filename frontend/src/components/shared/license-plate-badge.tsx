import { formatLicensePlate, isMercosulPlate } from "@/utils/plate-formatter";
import { cn } from "@/lib/utils";

interface LicensePlateBadgeProps {
  plate: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LicensePlateBadge({
  plate,
  className,
  size = "md"
}: LicensePlateBadgeProps) {
  const formatted = formatLicensePlate(plate);
  const mercosul = isMercosulPlate(plate);

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5 min-w-[72px]",
    md: "text-sm px-2.5 py-1 min-w-[88px]",
    lg: "text-base px-3 py-1.5 min-w-[104px]"
  };

  if (mercosul) {
    return (
      <div
        className={cn(
          "inline-flex flex-col items-center rounded border border-neutral-300 bg-white font-mono font-bold tracking-widest text-neutral-900 shadow-sm",
          sizeStyles[size],
          className
        )}
      >
        <div className="flex w-full items-center justify-between border-b border-blue-800 bg-blue-700 px-1 py-[1px] text-[8px] font-semibold tracking-normal text-white">
          <span>BRASIL</span>
          <span className="text-[7px]">🇧🇷</span>
        </div>
        <span className="leading-tight">{formatted}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded border border-neutral-500 bg-neutral-800 font-mono font-bold tracking-widest text-neutral-100 shadow-sm",
        sizeStyles[size],
        className
      )}
    >
      <span>{formatted}</span>
    </div>
  );
}
