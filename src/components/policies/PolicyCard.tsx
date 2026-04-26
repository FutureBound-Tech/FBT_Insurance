import { cn, formatCurrency } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Users,
  Heart,
  Briefcase,
  Target,
  TrendingUp,
  Check,
  Calculator,
  GitCompare,
  ArrowRight,
} from "lucide-react"

interface PolicyCardProps {
  policy: {
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
    bestFor: { ageGroups?: string[]; goals?: string[]; occupations?: string[] }
    category?: { name: string; icon?: string }
  }
  recommendation?: {
    matchScore: number
    matchReasons: string[]
    recommendedSumAssured: number
    recommendedTerm: number
    estimatedMonthlyPremium: number
  }
  onCalculate?: () => void
  onCompare?: () => void
  compact?: boolean
}

function CircularScore({ score }: { score: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-500"
  const bg =
    score >= 80
      ? "stroke-green-500/10"
      : score >= 60
        ? "stroke-yellow-500/10"
        : "stroke-red-500/10"

  return (
    <div className="relative flex h-16 w-16 items-center justify-center">
      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" strokeWidth="5" className={bg} />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          className={cn("transition-all duration-700 ease-out", color)}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className={cn("absolute text-sm font-bold", color)}>{score}%</span>
    </div>
  )
}

const categoryIconMap: Record<string, React.ReactNode> = {
  term: <Shield className="h-4 w-4" />,
  endowment: <TrendingUp className="h-4 w-4" />,
  ulip: <TrendingUp className="h-4 w-4" />,
  pension: <Users className="h-4 w-4" />,
  health: <Heart className="h-4 w-4" />,
  child: <Users className="h-4 w-4" />,
  whole: <Shield className="h-4 w-4" />,
}

export default function PolicyCard({
  policy,
  recommendation,
  onCalculate,
  onCompare,
  compact = false,
}: PolicyCardProps) {
  const taxKeys = Object.keys(policy.taxBenefits).filter((k) => policy.taxBenefits[k])
  const features = policy.features.slice(0, 3)
  const categoryKey = policy.category?.name?.toLowerCase()?.split(" ")[0] || ""
  const categoryIcon = categoryIconMap[categoryKey] || <Shield className="h-4 w-4" />

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
        compact ? "p-4" : ""
      )}
    >
      <CardHeader className={cn("pb-3", compact ? "p-4 pb-2" : "")}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              {policy.category && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  {categoryIcon}
                  {policy.category.name}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                Plan #{policy.planNumber}
              </span>
            </div>
            <CardTitle className={cn("truncate", compact ? "text-base" : "text-lg")}>
              {policy.name}
            </CardTitle>
          </div>
          {recommendation && <CircularScore score={recommendation.matchScore} />}
        </div>

        {!compact && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {policy.description}
          </p>
        )}
      </CardHeader>

      <CardContent className={cn("space-y-4", compact ? "p-4 pt-0" : "")}>
        {/* Age & Sum Assured Ranges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/50 p-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Age
            </p>
            <p className="text-sm font-semibold">
              {policy.minAge} - {policy.maxAge} yrs
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Sum Assured
            </p>
            <p className="text-sm font-semibold">
              {formatCurrency(policy.minSumAssured)} - {formatCurrency(policy.maxSumAssured)}
            </p>
          </div>
        </div>

        {/* Key Features */}
        {!compact && features.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Key Features
            </p>
            <ul className="space-y-1">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                  <span className="line-clamp-1">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Match Reasons */}
        {recommendation && recommendation.matchReasons.length > 0 && !compact && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Why This Plan
            </p>
            <div className="space-y-1">
              {recommendation.matchReasons.slice(0, 3).map((r, i) => (
                <div key={i} className="flex items-start gap-1.5 text-sm text-emerald-600 dark:text-green-400">
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span className="line-clamp-1">{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Premium */}
        {recommendation && (
          <div className="rounded-lg border bg-primary/5 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Est. Monthly Premium</p>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(recommendation.estimatedMonthlyPremium)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Sum Assured</p>
                <p className="text-sm font-semibold">
                  {formatCurrency(recommendation.recommendedSumAssured)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {recommendation.recommendedTerm} yrs term
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5">
          {policy.loanFacility && (
            <Badge variant="outline" className="gap-1 text-[11px] text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
              <Check className="h-3 w-3" />
              Loan Available
            </Badge>
          )}
          {taxKeys.map((key) => (
            <Badge
              key={key}
              variant="outline"
              className="gap-1 text-[11px] text-green-600 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800"
            >
              Sec {key}
            </Badge>
          ))}
        </div>

        {/* Best For Tags */}
        {!compact && policy.bestFor && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Best For
            </p>
            <div className="flex flex-wrap gap-1.5">
              {policy.bestFor.occupations?.slice(0, 3).map((o) => (
                <Badge
                  key={o}
                  variant="secondary"
                  className="gap-1 text-[11px]"
                >
                  <Briefcase className="h-3 w-3" />
                  {o}
                </Badge>
              ))}
              {policy.bestFor.goals?.slice(0, 3).map((g) => (
                <Badge
                  key={g}
                  variant="secondary"
                  className="gap-1 text-[11px]"
                >
                  <Target className="h-3 w-3" />
                  {g}
                </Badge>
              ))}
              {policy.bestFor.ageGroups?.slice(0, 2).map((a) => (
                <Badge
                  key={a}
                  variant="secondary"
                  className="gap-1 text-[11px]"
                >
                  <Users className="h-3 w-3" />
                  {a}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          {onCalculate && (
            <Button onClick={onCalculate} className="flex-1 gap-1.5" size="sm">
              <Calculator className="h-4 w-4" />
              Calculate Premium
            </Button>
          )}
          {onCompare && (
            <Button onClick={onCompare} variant="outline" size="sm" className="gap-1.5">
              <GitCompare className="h-4 w-4" />
              Compare
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
