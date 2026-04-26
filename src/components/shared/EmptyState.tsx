import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-16 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <Icon className="h-7 w-7 text-gray-400" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

      {description && (
        <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 rounded-lg bg-[#1e3a5f] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#162d4a] hover:shadow-md"
        >
          {action.label}
        </button>
      )}

      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
