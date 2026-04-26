import { useState } from "react"
import { cn, formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Check,
  X,
  Plus,
  TrendingUp,
  Shield,
  Heart,
  ArrowRight,
  Star,
  BadgeCheck,
} from "lucide-react"

interface ComparisonPolicy {
  id: string
  name: string
  planNumber: string
  description: string
  features: string[]
  minAge: number
  maxAge: number
  minSumAssured: number
  maxSumAssured: number
  minTerm: number
  maxTerm: number
  taxBenefits: Record<string, boolean>
  loanFacility: boolean
  category?: { name: string; icon?: string }
  estimatedMonthlyPremium?: number
  estimatedMaturityAmount?: number
}

interface PolicyComparisonProps {
  policies: ComparisonPolicy[]
  maxPolicies?: number
  onAddPolicy?: () => void
  onRemovePolicy?: (id: string) => void
  onGetPlan?: (policy: ComparisonPolicy) => void
}

interface MetricRowProps {
  label: string
  values: (string | number | boolean | null)[]
  bestIndex?: number
  isCurrency?: boolean
}

function MetricRow({ label, values, bestIndex, isCurrency = false }: MetricRowProps) {
  return (
    <div className="grid grid-cols-[1fr_repeat(var(--cols),minmax(0,1fr))] gap-2 items-center py-3 border-b last:border-0"
      style={{ "--cols": values.length } as React.CSSProperties}
    >
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {values.map((val, i) => (
        <div key={i} className="flex items-center justify-center gap-1.5">
          {val === null || val === undefined ? (
            <span className="text-sm text-muted-foreground">-</span>
          ) : typeof val === "boolean" ? (
            val ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <X className="h-5 w-5 text-muted-foreground/40" />
            )
          ) : (
            <span
              className={cn(
                "text-sm font-semibold",
                bestIndex === i
                  ? "text-green-600 dark:text-green-400"
                  : "text-foreground"
              )}
            >
              {isCurrency ? formatCurrency(Number(val)) : val}
            </span>
          )}
          {bestIndex === i && (
            <BadgeCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  )
}

export default function PolicyComparison({
  policies,
  maxPolicies = 3,
  onAddPolicy,
  onRemovePolicy,
  onGetPlan,
}: PolicyComparisonProps) {
  const slots = Array.from({ length: maxPolicies })

  const getTaxSections = (p: ComparisonPolicy) =>
    Object.keys(p.taxBenefits).filter((k) => p.taxBenefits[k])

  const lowestPremium = policies.length
    ? Math.min(
        ...policies.map((p) => p.estimatedMonthlyPremium ?? Infinity)
      )
    : 0
  const highestMaturity = policies.length
    ? Math.max(
        ...policies.map((p) => p.estimatedMaturityAmount ?? 0)
      )
    : 0

  const getBestPremiumIndex = () => {
    if (!policies.some((p) => p.estimatedMonthlyPremium)) return -1
    return policies.findIndex(
      (p) => p.estimatedMonthlyPremium === lowestPremium
    )
  }

  const getBestMaturityIndex = () => {
    if (!policies.some((p) => p.estimatedMaturityAmount)) return -1
    return policies.findIndex(
      (p) => p.estimatedMaturityAmount === highestMaturity
    )
  }

  const premiumIdx = getBestPremiumIndex()
  const maturityIdx = getBestMaturityIndex()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Compare Plans</h2>
        <p className="text-muted-foreground mt-1">
          Compare up to {maxPolicies} plans side by side
        </p>
      </div>

      {/* Mobile: Vertical cards */}
      <div className="grid gap-4 md:hidden">
        {policies.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  {p.category && (
                    <Badge variant="secondary" className="mb-1.5 text-xs">
                      {p.category.name}
                    </Badge>
                  )}
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Plan #{p.planNumber}
                  </p>
                </div>
                {onRemovePolicy && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={() => onRemovePolicy(p.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Premium</span>
                <span className="font-semibold">
                  {p.estimatedMonthlyPremium
                    ? formatCurrency(p.estimatedMonthlyPremium)
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coverage</span>
                <span className="font-semibold">
                  {formatCurrency(p.minSumAssured)} - {formatCurrency(p.maxSumAssured)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Term</span>
                <span className="font-semibold">
                  {p.minTerm} - {p.maxTerm} yrs
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maturity Amount</span>
                <span className="font-semibold">
                  {p.estimatedMaturityAmount
                    ? formatCurrency(p.estimatedMaturityAmount)
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tax Benefits</span>
                <div className="flex gap-1">
                  {getTaxSections(p).length > 0 ? (
                    getTaxSections(p).map((s) => (
                      <Badge key={s} variant="outline" className="text-[10px] text-green-600 border-green-200 bg-green-50">
                        {s}
                      </Badge>
                    ))
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/40" />
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Loan Facility</span>
                {p.loanFacility ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground/40" />
                )}
              </div>
              {onGetPlan && (
                <Button className="w-full mt-2" onClick={() => onGetPlan(p)}>
                  Get This Plan
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {policies.length < maxPolicies && onAddPolicy && (
          <button
            onClick={onAddPolicy}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 p-6 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm font-medium">Add a Policy</span>
          </button>
        )}
      </div>

      {/* Desktop: Side-by-side table */}
      <div className="hidden md:block">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Policy Headers */}
            <div
              className="grid border-b bg-muted/30"
              style={{
                gridTemplateColumns: `200px repeat(${maxPolicies}, 1fr)`,
              }}
            >
              <div className="p-4 border-r" />
              {slots.map((_, i) => {
                const p = policies[i]
                return (
                  <div
                    key={i}
                    className={cn(
                      "p-4 border-r last:border-0 text-center",
                      !p && "flex items-center justify-center"
                    )}
                  >
                    {p ? (
                      <div className="relative">
                        {onRemovePolicy && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute -top-1 -right-1 h-6 w-6 text-muted-foreground"
                            onClick={() => onRemovePolicy(p.id)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {p.category && (
                          <Badge variant="secondary" className="mb-2 text-xs">
                            {p.category.name}
                          </Badge>
                        )}
                        <h3 className="font-semibold text-base">{p.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Plan #{p.planNumber}
                        </p>
                      </div>
                    ) : (
                      onAddPolicy && (
                        <button
                          onClick={onAddPolicy}
                          className="flex flex-col items-center gap-1.5 rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary w-full"
                        >
                          <Plus className="h-6 w-6" />
                          <span className="text-xs font-medium">Add Policy</span>
                        </button>
                      )
                    )}
                  </div>
                )
              })}
            </div>

            {/* Metrics */}
            <div className="px-4">
              <MetricRow
                label="Monthly Premium"
                values={policies.map((p) => p.estimatedMonthlyPremium ?? null)}
                bestIndex={premiumIdx >= 0 ? premiumIdx : undefined}
                isCurrency
              />
              <MetricRow
                label="Maturity Amount"
                values={policies.map((p) => p.estimatedMaturityAmount ?? null)}
                bestIndex={maturityIdx >= 0 ? maturityIdx : undefined}
                isCurrency
              />
              <MetricRow
                label="Coverage Range"
                values={policies.map((p) =>
                  p.maxSumAssured
                    ? `${formatCurrency(p.minSumAssured)} - ${formatCurrency(p.maxSumAssured)}`
                    : null
                )}
              />
              <MetricRow
                label="Term Range"
                values={policies.map((p) =>
                  p.minTerm ? `${p.minTerm} - ${p.maxTerm} yrs` : null
                )}
              />
              <MetricRow
                label="Tax Benefits"
                values={policies.map((p) => {
                  const sections = getTaxSections(p)
                  return sections.length > 0 ? sections.join(", ") : null
                })}
              />
              <MetricRow
                label="Loan Facility"
                values={policies.map((p) => p.loanFacility)}
              />
              <MetricRow
                label="Age Eligibility"
                values={policies.map((p) =>
                  p.minAge ? `${p.minAge} - ${p.maxAge} yrs` : null
                )}
              />
            </div>

            {/* CTA Row */}
            {onGetPlan && (
              <div
                className="grid border-t bg-muted/10 p-4"
                style={{
                  gridTemplateColumns: `200px repeat(${maxPolicies}, 1fr)`,
                }}
              >
                <div />
                {slots.map((_, i) => {
                  const p = policies[i]
                  return (
                    <div key={i} className="px-2">
                      {p && (
                        <Button
                          className="w-full"
                          onClick={() => onGetPlan(p)}
                        >
                          Get This Plan
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      {policies.length >= 2 && (
        <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-300">
                  Quick Summary
                </h4>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  {premiumIdx >= 0 && (
                    <>
                      <strong>{policies[premiumIdx].name}</strong> offers the lowest premium
                      {maturityIdx >= 0 && premiumIdx !== maturityIdx
                        ? ` while `
                        : "."}
                    </>
                  )}
                  {maturityIdx >= 0 && maturityIdx !== premiumIdx && (
                    <>
                      <strong>{policies[maturityIdx].name}</strong> provides the highest
                      estimated maturity amount.
                    </>
                  )}
                  {policies.every((p) => p.loanFacility) &&
                    " All compared plans offer loan facilities."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
