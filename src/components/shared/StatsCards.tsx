import { useEffect, useState, type ComponentType } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change?: number;
  icon: ComponentType<{ className?: string }>;
  color?: "blue" | "green" | "amber" | "red" | "purple";
}

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-500/10" },
  green: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-500/10" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-500/10" },
  red: { bg: "bg-red-50", text: "text-red-600", ring: "ring-red-500/10" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", ring: "ring-purple-500/10" },
};

function useAnimatedCounter(target: number, duration = 800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      if (current !== start) {
        start = current;
        setCount(current);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
}

export default function StatsCard({
  title,
  value,
  prefix = "",
  suffix = "",
  change,
  icon: Icon,
  color = "blue",
}: StatsCardProps) {
  const count = useAnimatedCounter(value);
  const scheme = colorMap[color] ?? colorMap.blue;

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {prefix}
            {count.toLocaleString("en-IN")}
            {suffix}
          </p>
          {change !== undefined && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                change >= 0 ? "text-emerald-600" : "text-red-600"
              )}
            >
              {change >= 0 ? "+" : ""}
              {change}% from last month
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-inset",
            scheme.bg,
            scheme.text,
            scheme.ring
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

interface StatsCardsProps {
  cards: StatsCardProps[];
}

export function StatsCards({ cards }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <StatsCard key={idx} {...card} />
      ))}
    </div>
  );
}
