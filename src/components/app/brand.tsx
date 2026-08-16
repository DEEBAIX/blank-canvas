import logo from "@/assets/ssd-logo.png.asset.json";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src={logo.url}
      alt="Smart Society Development NGO logo"
      className={cn("h-10 w-10 rounded-full object-contain", className)}
      loading="eager"
    />
  );
}

export function BrandLockup({
  className,
  subtitle = "Consortium OS",
  invert = false,
}: {
  className?: string;
  subtitle?: string;
  invert?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandMark />
      <div className="leading-tight">
        <div
          className={cn(
            "font-display text-sm font-semibold tracking-tight",
            invert ? "text-primary-foreground" : "text-foreground",
          )}
        >
          Smart Society Development
        </div>
        <div className={cn("text-xs", invert ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}

export function CountryTag({ code, country }: { code?: string | null; country?: string | null }) {
  const flag = code
    ? String.fromCodePoint(
        ...code
          .toUpperCase()
          .slice(0, 2)
          .split("")
          .map((c) => 127397 + c.charCodeAt(0)),
      )
    : "🏳";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
      <span aria-hidden>{flag}</span>
      <span>{country || code || "Unknown"}</span>
    </span>
  );
}
