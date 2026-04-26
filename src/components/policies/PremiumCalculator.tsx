import { useState, useMemo } from "react"
import { cn, formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import {
  Calculator,
  IndianRupee,
  TrendingUp,
  Shield,
  ArrowRight,
  GitCompare,
  Info,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface PremiumPolicy {
  id: string
  name: string
  planNumber: string
  minAge: number
  maxAge: number
  minSumAssured: number
  maxSumAssured: number
  minTerm: number
  maxTerm: number
  taxBenefits: Record<string, boolean>
  category?: { name: string }
}

type Frequency = "yearly" | "half-yearly" | "quarterly" | "monthly"

const frequencyMultipliers: Record<Frequency, number> = {
  yearly: 1,
  "half-yearly": 0.51,
  quarterly: 0.26,
  monthly: 0.088,
}

const frequencyLabels: Record<Frequency, string> = {
  yearly: "Yearly",
  "half-yearly": "Half-Yearly",
  quarterly: "Quarterly",
  monthly: "Monthly",
}

interface PremiumCalculatorProps {
  policy: PremiumPolicy
  userAge?: number
  leadId?: string
  onGetPlan?: (details: { sumAssured: number; term: number; premium: number }) => void
  onAddToCompare?: () => void
}

export default function PremiumCalculator({
  policy,
  userAge = 30,
  leadId,
  onGetPlan,
  onAddToCompare,
}: PremiumCalculatorProps) {
  const [age, setAge] = useState(Math.max(policy.minAge, Math.min(policy.maxAge, userAge)))
  const [sumAssured, setSumAssured] = useState(
    Math.max(policy.minSumAssured, Math.min(policy.maxSumAssured, 1000000))
  )
  const [term, setTerm] = useState(
    Math.max(policy.minTerm, Math.min(policy.maxTerm, policy.minTerm + 5))
  )
  const [isMale, setIsMale] = useState(true)
  const [frequency, setFrequency] = useState<Frequency>("yearly")
  const [sumAssuredInput, setSumAssuredInput] = useState(formatCurrency(1000000))

  const premiumCalculation = useMemo(() => {
    const baseRate = 0.012
    const ageFactor = 1 + (age - 25) * 0.008
    const termDiscount = term > 20 ? 0.95 : term > 15 ? 0.97 : 1
    const genderFactor = isMale ? 1.05 : 0.95

    const yearlyPremium = Math.round(
      sumAssured * baseRate * ageFactor * termDiscount * genderFactor
    )
    const freqPremium = Math.round(yearlyPremium * frequencyMultipliers[frequency])
    const totalPremium = yearlyPremium * term
    const maturityAmount = Math.round(sumAssured * (1 + 0.055 * term))
    const deathBenefit = Math.max(sumAssured, maturityAmount)
    const roi = Number(((maturityAmount - totalPremium) / totalPremium * 100).toFixed(1))

    const premiums80C = Math.min(yearlyPremium, 150000)
    const taxSaving80C = Math.round(premiums80C * 0.3)
    const taxSaving80D = policy.taxBenefits["80D"] ? Math.round(25000 * 0.3) : 0

    const yearly = yearlyPremium
    const halfYearly = Math.round(yearlyPremium * frequencyMultipliers["half-yearly"])
    const quarterly = Math.round(yearlyPremium * frequencyMultipliers.quarterly)
    const monthly = Math.round(yearlyPremium * frequencyMultipliers.monthly)

    return {
      freqPremium,
      totalPremium,
      maturityAmount,
      deathBenefit,
      roi,
      taxSaving80C,
      taxSaving80D,
      premiums: { yearly, halfYearly, quarterly, monthly },
    }
  }, [age, sumAssured, term, isMale, frequency, policy.taxBenefits])

  const handleSumAssuredChange = (val: string) => {
    setSumAssuredInput(val)
    const num = parseInt(val.replace(/[^\d]/g, ""), 10)
    if (!isNaN(num)) {
      setSumAssured(Math.max(policy.minSumAssured, Math.min(policy.maxSumAssured, num)))
    }
  }

  const chartData = [
    { name: "Total Premium", value: premiumCalculation.totalPremium, fill: "#3b82f6" },
    { name: "Maturity", value: premiumCalculation.maturityAmount, fill: "#22c55e" },
    { name: "Death Benefit", value: premiumCalculation.deathBenefit, fill: "#f59e0b" },
    { name: "Profit", value: premiumCalculation.maturityAmount - premiumCalculation.totalPremium, fill: "#a855f7" },
  ]

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Premium Calculator</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          {policy.name} - Plan #{policy.planNumber}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Age Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Your Age</Label>
            <span className="text-sm font-bold text-primary">{age} years</span>
          </div>
          <Slider
            min={policy.minAge}
            max={policy.maxAge}
            value={age}
            onChange={setAge}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{policy.minAge} yrs</span>
            <span>{policy.maxAge} yrs</span>
          </div>
        </div>

        {/* Sum Assured */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Sum Assured</Label>
            <span className="text-xs text-muted-foreground">
              {formatCurrency(policy.minSumAssured)} - {formatCurrency(policy.maxSumAssured)}
            </span>
          </div>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={sumAssuredInput}
              onChange={(e) => handleSumAssuredChange(e.target.value)}
              className="pl-9"
              onBlur={() => setSumAssuredInput(formatCurrency(sumAssured))}
              onFocus={() => setSumAssuredInput(sumAssured.toString())}
            />
          </div>
          {sumAssured === policy.minSumAssured && (
            <p className="text-xs text-amber-600">Minimum sum assured reached</p>
          )}
          {sumAssured === policy.maxSumAssured && (
            <p className="text-xs text-amber-600">Maximum sum assured reached</p>
          )}
        </div>

        {/* Term Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Policy Term</Label>
            <span className="text-sm font-bold text-primary">{term} years</span>
          </div>
          <Slider
            min={policy.minTerm}
            max={policy.maxTerm}
            value={term}
            onChange={setTerm}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{policy.minTerm} yrs</span>
            <span>{policy.maxTerm} yrs</span>
          </div>
        </div>

        {/* Gender Toggle */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Gender</Label>
          <div className="flex gap-2">
            <Button
              variant={isMale ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setIsMale(true)}
            >
              Male
            </Button>
            <Button
              variant={!isMale ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setIsMale(false)}
            >
              Female
            </Button>
          </div>
        </div>

        {/* Frequency Tabs */}
        <Tabs
          value={frequency}
          onValueChange={(v) => setFrequency(v as Frequency)}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="yearly" className="text-xs">
              Yearly
            </TabsTrigger>
            <TabsTrigger value="half-yearly" className="text-xs">
              Half-Yearly
            </TabsTrigger>
            <TabsTrigger value="quarterly" className="text-xs">
              Quarterly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">
              Monthly
            </TabsTrigger>
          </TabsList>

          {(["yearly", "half-yearly", "quarterly", "monthly"] as Frequency[]).map((freq) => (
            <TabsContent key={freq} value={freq} className="mt-4">
              <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {frequencyLabels[freq]} Premium
                </p>
                <p className="mt-1 text-3xl font-bold text-primary">
                  {formatCurrency(
                    Math.round(premiumCalculation.premiums.yearly * frequencyMultipliers[freq])
                  )}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {freq === "yearly"
                    ? `Total over ${term} years: ${formatCurrency(premiumCalculation.totalPremium)}`
                    : `Yearly: ${formatCurrency(premiumCalculation.premiums.yearly)}`}
                </p>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Results Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Total Premium</p>
            <p className="mt-0.5 text-lg font-bold">{formatCurrency(premiumCalculation.totalPremium)}</p>
            <p className="text-[11px] text-muted-foreground">Over {term} years</p>
          </div>
          <div className="rounded-lg border bg-green-50/50 border-green-200 p-3 dark:bg-green-950/20 dark:border-green-800">
            <p className="text-xs text-green-700 dark:text-green-400">Maturity Amount</p>
            <p className="mt-0.5 text-lg font-bold text-green-700 dark:text-green-400">
              {formatCurrency(premiumCalculation.maturityAmount)}
            </p>
            <p className="text-[11px] text-green-600/70 dark:text-green-500/70">Estimated</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
            <p className="text-xs text-amber-700">Death Benefit</p>
            <p className="mt-0.5 text-lg font-bold text-amber-700">
              {formatCurrency(premiumCalculation.deathBenefit)}
            </p>
            <p className="text-[11px] text-amber-600/70">Guaranteed to family</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">ROI</p>
            <p className="mt-0.5 text-lg font-bold text-purple-600">{premiumCalculation.roi}%</p>
            <p className="text-[11px] text-muted-foreground">Return on investment</p>
          </div>
          <div className="rounded-lg border p-3 col-span-2">
            <p className="text-xs text-muted-foreground">Tax Savings</p>
            <p className="mt-0.5 text-lg font-bold text-emerald-600">
              {formatCurrency(premiumCalculation.taxSaving80C + premiumCalculation.taxSaving80D)}
            </p>
            <div className="flex gap-1 mt-1">
              {premiumCalculation.taxSaving80C > 0 && (
                <Badge variant="outline" className="text-[10px] text-green-600 border-green-200 bg-green-50">
                  80C: {formatCurrency(premiumCalculation.taxSaving80C)}
                </Badge>
              )}
              {premiumCalculation.taxSaving80D > 0 && (
                <Badge variant="outline" className="text-[10px] text-green-600 border-green-200 bg-green-50">
                  80D: {formatCurrency(premiumCalculation.taxSaving80D)}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Investment Summary */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Full Policy Summary</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4">
              <p className="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                <span>✅</span> Without Death (Maturity)
              </p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="font-semibold text-red-600">- {formatCurrency(premiumCalculation.totalPremium)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Maturity</span>
                  <span className="font-semibold text-emerald-600">+ {formatCurrency(premiumCalculation.maturityAmount)}</span>
                </div>
                <div className="border-t pt-1.5 flex justify-between">
                  <span className="font-semibold">Net</span>
                  <span className={cn(
                    "font-bold",
                    premiumCalculation.maturityAmount - premiumCalculation.totalPremium >= 0 ? "text-emerald-600" : "text-red-600"
                  )}>
                    {formatCurrency(premiumCalculation.maturityAmount - premiumCalculation.totalPremium)}
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4">
              <p className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1.5">
                <span>👨‍👩‍👧‍👦</span> With Death Benefit
              </p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Death Benefit</span>
                  <span className="font-bold text-amber-600">{formatCurrency(premiumCalculation.deathBenefit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Surplus</span>
                  <span className="font-semibold text-amber-700">+ {formatCurrency(premiumCalculation.deathBenefit - premiumCalculation.totalPremium)}</span>
                </div>
                <div className="border-t pt-1.5 flex justify-between">
                  <span className="font-semibold">Family Gets</span>
                  <span className="font-bold text-amber-600">{formatCurrency(premiumCalculation.deathBenefit)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium vs Maturity Chart */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Premium vs Maturity</Label>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(v) => formatCurrency(v)}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  width={100}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value))]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Premium is indicative and based on basic rates. Actual premium may vary
            based on medical history, occupation, and other factors. Maturity amount
            is estimated based on assumed bonus rates.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3">
          {onGetPlan && (
            <Button
              className="flex-1 gap-1.5"
              onClick={() =>
                onGetPlan({
                  sumAssured,
                  term,
                  premium: premiumCalculation.premiums.yearly,
                })
              }
            >
              Get This Plan
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {onAddToCompare && (
            <Button variant="outline" className="gap-1.5" onClick={onAddToCompare}>
              <GitCompare className="h-4 w-4" />
              Compare
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
