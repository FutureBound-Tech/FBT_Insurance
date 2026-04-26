import { cn, formatCurrency } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import PremiumCalculator from "./PremiumCalculator"
import {
  X,
  Shield,
  Heart,
  Users,
  TrendingUp,
  Check,
  Star,
  ArrowRight,
  Quote,
  Landmark,
  AlertCircle,
  FileText,
} from "lucide-react"

interface DetailPolicy {
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

interface PolicyDetailProps {
  policy: DetailPolicy
  onClose: () => void
  userAge?: number
  onGetPlan?: (details: { sumAssured: number; term: number; premium: number }) => void
  onAddToCompare?: () => void
}

interface BenefitItem {
  icon: React.ReactNode
  label: string
  description: string
}

const benefitDetails: Record<string, BenefitItem> = {
  maturity: {
    icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
    label: "Maturity Benefit",
    description:
      "Sum Assured along with accrued bonuses payable on survival to the end of the policy term.",
  },
  death: {
    icon: <Shield className="h-5 w-5 text-red-500" />,
    label: "Death Benefit",
    description:
      "Sum Assured on Death along with accrued bonuses payable to the nominee. Death benefit is at least 105% of total premiums paid.",
  },
  accident: {
    icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
    label: "Accidental Death Benefit",
    description:
      "Additional Sum Assured payable in case of accidental death during the policy term, over and above the death benefit.",
  },
}

const taxBenefitExplanations: Record<string, string> = {
  "80C":
    "Premiums paid (up to ₹1.5 lakh per year) qualify for deduction under Section 80C of the Income Tax Act.",
  "80D":
    "Premium paid towards health-related riders may qualify for deduction under Section 80D, up to ₹25,000 (₹50,000 for senior citizens).",
  "10(10D)":
    "Maturity proceeds and death benefits are exempt from tax under Section 10(10D), subject to conditions (premium ≤ 10% of Sum Assured).",
}

export default function PolicyDetail({
  policy,
  onClose,
  userAge,
  onGetPlan,
  onAddToCompare,
}: PolicyDetailProps) {
  const taxKeys = Object.keys(policy.taxBenefits).filter((k) => policy.taxBenefits[k])

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl lg:max-w-3xl p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-start justify-between p-6 pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {policy.category && (
                  <Badge variant="secondary" className="text-xs">
                    {policy.category.name}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  Plan #{policy.planNumber}
                </span>
              </div>
              <DialogTitle className="text-xl">{policy.name}</DialogTitle>
            </div>
          </div>
        </div>

        <div className="p-6 pt-2 space-y-6">
          {/* Description */}
          <p className="text-sm leading-relaxed text-muted-foreground">
            {policy.description}
          </p>

          {/* Quick Facts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <Users className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Age</p>
              <p className="text-sm font-semibold">
                {policy.minAge}-{policy.maxAge} yrs
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <TrendingUp className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Sum Assured</p>
              <p className="text-sm font-semibold">
                {formatCurrency(policy.minSumAssured / 100000)}L -{" "}
                {formatCurrency(policy.maxSumAssured / 100000)}L
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <FileText className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Term</p>
              <p className="text-sm font-semibold">
                {policy.minTerm}-{policy.maxTerm} yrs
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              {policy.loanFacility ? (
                <Landmark className="mx-auto h-5 w-5 text-green-500 mb-1" />
              ) : (
                <Landmark className="mx-auto h-5 w-5 text-muted-foreground/40 mb-1" />
              )}
              <p className="text-xs text-muted-foreground">Loan</p>
              <p className="text-sm font-semibold">
                {policy.loanFacility ? "Available" : "N/A"}
              </p>
            </div>
          </div>

          {/* Tabbed Content */}
          <Tabs defaultValue="features" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="features" className="text-xs">
                Features
              </TabsTrigger>
              <TabsTrigger value="benefits" className="text-xs">
                Benefits
              </TabsTrigger>
              <TabsTrigger value="tax" className="text-xs">
                Tax
              </TabsTrigger>
              <TabsTrigger value="calculator" className="text-xs">
                Calculator
              </TabsTrigger>
              <TabsTrigger value="review" className="text-xs">
                Review
              </TabsTrigger>
            </TabsList>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-4 mt-4">
              <div className="space-y-2">
                {policy.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-lg bg-muted/30 p-3"
                  >
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Best For */}
              {policy.bestFor && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Best For</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {policy.bestFor.occupations?.map((o) => (
                      <Badge key={o} variant="secondary" className="text-xs">
                        {o}
                      </Badge>
                    ))}
                    {policy.bestFor.goals?.map((g) => (
                      <Badge key={g} variant="secondary" className="text-xs">
                        {g}
                      </Badge>
                    ))}
                    {policy.bestFor.ageGroups?.map((a) => (
                      <Badge key={a} variant="secondary" className="text-xs">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Benefits Tab */}
            <TabsContent value="benefits" className="space-y-4 mt-4">
              {Object.entries(benefitDetails).map(([key, detail]) => (
                <Card key={key}>
                  <CardContent className="flex items-start gap-3 p-4">
                    {detail.icon}
                    <div>
                      <h4 className="text-sm font-semibold">{detail.label}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {detail.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {policy.loanFacility && (
                <Card>
                  <CardContent className="flex items-start gap-3 p-4">
                    <Landmark className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="text-sm font-semibold">Loan Facility</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        You can avail a loan against this policy after the
                        completion of the lock-in period, typically up to 80-90% of
                        the surrender value. Interest rates are competitive and the
                        policy continues to earn bonuses.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Surrender Rules */}
              <Card>
                <CardContent className="flex items-start gap-3 p-4">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <div>
                    <h4 className="text-sm font-semibold">Surrender Rules</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      The policy can be surrendered after paying premiums for at least
                      2 full years. Surrender value will be the Guaranteed Surrender
                      Value or Special Surrender Value, whichever is higher. Early
                      surrender may result in a loss.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tax Tab */}
            <TabsContent value="tax" className="space-y-4 mt-4">
              {taxKeys.length > 0 ? (
                taxKeys.map((section) => (
                  <Card key={section}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-500" />
                        <CardTitle className="text-base">
                          Section {section}
                        </CardTitle>
                        <Badge className="text-[10px] bg-green-100 text-green-700">
                          Eligible
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {taxBenefitExplanations[section] ||
                          "This policy qualifies for tax benefits under this section."}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No specific tax benefits listed for this policy.
                </div>
              )}

              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Disclaimer:</strong> Tax benefits are subject to changes in
                  tax laws. Please consult your tax advisor for the latest applicable
                  deductions and exemptions.
                </p>
              </div>
            </TabsContent>

            {/* Calculator Tab */}
            <TabsContent value="calculator" className="mt-4">
              <PremiumCalculator
                policy={policy}
                userAge={userAge}
                onGetPlan={onGetPlan}
                onAddToCompare={onAddToCompare}
              />
            </TabsContent>

            {/* Review Tab */}
            <TabsContent value="review" className="mt-4">
              <Card>
                <CardContent className="p-5">
                  <Quote className="mb-3 h-8 w-8 text-amber-200" />
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < 4
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-200 text-gray-200"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    &ldquo;I invested in this policy 5 years ago and I am very
                    satisfied with the returns. The premium is affordable and the
                    claim process was smooth when my family needed it. Highly
                    recommend for anyone looking for a balanced insurance and savings
                    plan.&rdquo;
                  </p>
                  <div className="mt-4 border-t pt-3">
                    <p className="text-sm font-semibold">Rajesh Kumar</p>
                    <p className="text-xs text-muted-foreground">
                      42 yrs &middot; Software Engineer
                    </p>
                    <Badge variant="secondary" className="mt-1.5 text-[11px]">
                      {policy.name}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Bottom CTA */}
          <div className="flex gap-3 border-t pt-4">
            {onGetPlan && (
              <Button
                className="flex-1 gap-1.5"
                onClick={() =>
                  onGetPlan({
                    sumAssured: Math.round((policy.minSumAssured + policy.maxSumAssured) / 2),
                    term: Math.round((policy.minTerm + policy.maxTerm) / 2),
                    premium: 0,
                  })
                }
              >
                Get This Plan
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {onAddToCompare && (
              <Button variant="outline" className="gap-1.5" onClick={onAddToCompare}>
                Add to Compare
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
