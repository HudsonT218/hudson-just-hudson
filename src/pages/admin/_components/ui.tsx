import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/lib/lead-os-types";
import { admin, LEAD_STATUS_COLORS } from "./theme";

export function SectionLabel({
  children,
  icon,
  count,
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-[10px] uppercase font-medium tracking-[0.14em]",
        className,
      )}
      style={{ color: admin.textDim }}
    >
      {icon && <span className="inline-flex items-center">{icon}</span>}
      <span>{children}</span>
      {typeof count === "number" && (
        <span style={{ color: admin.textDim, opacity: 0.6 }}>({count})</span>
      )}
    </div>
  );
}

export function AdminCard({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("rounded-2xl p-5", className)}
      style={{
        backgroundColor: admin.surface,
        border: `1px solid ${admin.border}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function AdminPageHeader({
  title,
  actions,
  className,
}: {
  title: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <h1
        className="text-2xl font-semibold tracking-tight"
        style={{ color: admin.text, letterSpacing: "-0.02em" }}
      >
        {title}
      </h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn("inline-flex items-center gap-1 rounded-full p-1", className)}
      style={{
        backgroundColor: admin.surface,
        border: `1px solid ${admin.border}`,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
            style={{
              backgroundColor: active ? admin.surface2 : "transparent",
              color: active ? admin.text : admin.textMuted,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function StatusDot({ status, className }: { status: LeadStatus; className?: string }) {
  return (
    <span
      className={cn("inline-block rounded-full", className)}
      style={{
        width: 8,
        height: 8,
        backgroundColor: LEAD_STATUS_COLORS[status].dot,
      }}
    />
  );
}

export function GhostButton({
  className,
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
        "hover:[background-color:rgba(255,255,255,0.04)]",
        className,
      )}
      style={{
        backgroundColor: "transparent",
        color: admin.text,
        ...style,
      }}
    />
  );
}

export function EmptyState({
  children,
  icon,
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center text-center py-12 gap-2", className)}
      style={{ color: admin.textMuted }}
    >
      {icon && <div className="opacity-70">{icon}</div>}
      <div className="text-sm">{children}</div>
    </div>
  );
}
