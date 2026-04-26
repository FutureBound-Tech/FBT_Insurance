import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GitCompare,
  Plus,
  X,
  ArrowRight,
  Check,
  Minus,
  Shield,
  IndianRupee,
  Clock,
  TrendingUp,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";

interface Policy {
  id: string;
  name: string;
  planNumber: string;
  category: string;
  monthlyPremium: number;
  sumAssured: number;
  term: number;
  maturityBenefit: number | null;
  deathBenefit: number;
  loanAvailable: boolean;
  partialWithdrawal: boolean;
  criticalIllness: boolean;
  accidentalBenefit: boolean;
  taxBenefits: string[];
  minAge: number;
  maxAge: number;
  bonusRate: number;
  surrenderValue: boolean;
  freeLookPeriod: boolean;
  description: string;
}

const allPolicies: Policy[] = [
  {
    id: "tech-term",
    name: "LIC Tech Term",
    planNumber: "Plan 954",
    category: "Term",
    monthlyPremium: 2450,
    sumAssured: 10000000,
    term: 30,
    maturityBenefit: null,
    deathBenefit: 10000000,
    loanAvailable: false,
    partialWithdrawal: false,
    criticalIllness: true,
    accidentalBenefit: true,
    taxBenefits: ["Section 80C", "Section 10(10D)"],
    minAge: 18,
    maxAge: 65,
    bonusRate: 0,
    surrenderValue: false,
    freeLookPeriod: true,
    description: "Pure term insurance with highest coverage at lowest cost",
  },
  {
    id: "jeevan-anand",
    name: "LIC Jeevan Anand",
    planNumber: "Plan 915",
    category: "Endowment",
    monthlyPremium: 8500,
    sumAssured: 2500000,
    term: 25,
    maturityBenefit: 4800000,
    deathBenefit: 2500000,
    loanAvailable: true,
    partialWithdrawal: false,
    criticalIllness: true,
    accidentalBenefit: true,
    taxBenefits: ["Section 80C", "Section 10(10D)"],
    minAge: 18,
    maxAge: 50,
    bonusRate: 48,
    surrenderValue: true,
    freeLookPeriod: true,
    description: "Endowment plan with whole life coverage and guaranteed returns",
  },
  {
    id: "new-jeevan-anand",
    name: "LIC New Jeevan Anand",
    planNumber: "Plan 935",
    category: "Endowment",
    monthlyPremium: 6200,
    sumAssured: 2000000,
    term: 20,
    maturityBenefit: 3600000,
    deathBenefit: 2000000,
    loanAvailable: true,
    partialWithdrawal: false,
    criticalIllness: false,
    accidentalBenefit: true,
    taxBenefits: ["Section 80C", "Section 10(10D)"],
    minAge: 18,
    maxAge: 55,
    bonusRate: 42,
    surrenderValue: true,
    freeLookPeriod: true,
    description: "Balanced endowment with flexible premium options",
  },
  {
    id: "nivesh-plus",
    name: "LIC Nivesh Plus",
    planNumber: "Plan 849",
    category: "ULIP",
    monthlyPremium: 5000,
    sumAssured: 1500000,
    term: 15,
    maturityBenefit: 3200000,
    deathBenefit: 1500000,
    loanAvailable: false,
    partialWithdrawal: true,
    criticalIllness: false,
    accidentalBenefit: false,
    taxBenefits: ["Section 80C", "Section 10(10D)"],
    minAge: 18,
    maxAge: 60,
    bonusRate: 0,
    surrenderValue: true,
    freeLookPeriod: true,
    description: "Market-linked ULIP with fund switching options",
  },
  {
    id: "jeevan-shanti",
    name: "LIC Jeevan Shanti",
    planNumber: "Plan 850",
    category: "Pension",
    monthlyPremium: 10000,
    sumAssured: 3000000,
    term: 25,
    maturityBenefit: 5500000,
    deathBenefit: 3000000,
    loanAvailable: true,
    partialWithdrawal: false,
    criticalIllness: false,
    accidentalBenefit: false,
    taxBenefits: ["Section 80C", "Section 10(10D)"],
    minAge: 30,
    maxAge: 85,
    bonusRate: 0,
    surrenderValue: true,
    freeLookPeriod: true,
    description: "Guaranteed pension plan with annuity options",
  },
  {
    id: "amritbaal",
    name: "LIC Amritbaal",
    planNumber: "Plan 974",
    category: "Children",
    monthlyPremium: 4800,
    sumAssured: 1500000,
    term: 18,
    maturityBenefit: 2800000,
    deathBenefit: 1500000,
    loanAvailable: true,
    partialWithdrawal: false,
    criticalIllness: false,
    accidentalBenefit: true,
    taxBenefits: ["Section 80C", "Section 10(10D)"],
    minAge: 0,
    maxAge: 13,
    bonusRate: 45,
    surrenderValue: true,
    freeLookPeriod: true,
    description: "Children's education and future planning policy",
  },
];

function FeatureRow({
  label,
  values,
  type = "text",
}: {
  label: string;
  values: (string | number | boolean | null)[];
  type?: "text" | "currency" | "boolean" | "badge";
}) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-slate-600 whitespace-nowrap">
        {label}
      </td>
      {values.map((val, i) => (
        <td key={i} className="px-4 py-3 text-center">
          {type === "boolean" ? (
            val ? (
              <Check className="mx-auto h-5 w-5 text-emerald-500" />
            ) : (
              <Minus className="mx-auto h-5 w-5 text-gray-300" />
            )
          ) : type === "currency" ? (
            <span className="text-sm font-semibold text-foreground">
              {val !== null ? formatCurrency(val as number) : "N/A"}
            </span>
          ) : type === "badge" ? (
            <Badge variant="secondary" className="text-xs">
              {val}
            </Badge>
          ) : (
            <span className="text-sm text-slate-700">{val ?? "N/A"}</span>
          )}
        </td>
      ))}
    </tr>
  );
}

export default function Compare() {
  const [searchParams] = useSearchParams();
  const initialIds = searchParams.get("ids")?.split(",").filter(Boolean) || [];

  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialIds.length > 0
      ? initialIds
      : ["tech-term", "jeevan-anand"]
  );

  const selectedPolicies = useMemo(
    () => allPolicies.filter((p) => selectedIds.includes(p.id)),
    [selectedIds]
  );

  const addPolicy = (id: string) => {
    if (selectedIds.length < 3 && !selectedIds.includes(id)) {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  const removePolicy = (id: string) => {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const availablePolicies = allPolicies.filter((p) => !selectedIds.includes(p.id));

  return (
    <div className="min-h-screen bg-surface py-10 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <GitCompare className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-primary sm:text-4xl">
            Compare Policies
          </h1>
          <p className="mt-3 text-muted-foreground">
            Compare up to 3 policies side-by-side to make the best decision
          </p>
        </motion.div>

        {/* Policy Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">
                    Selected: {selectedIds.length}/3 policies
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedPolicies.map((p) => (
                      <Badge
                        key={p.id}
                        variant="secondary"
                        className="flex items-center gap-1.5 px-3 py-1"
                      >
                        {p.name}
                        <button
                          onClick={() => removePolicy(p.id)}
                          className="ml-0.5 rounded-full p-0.5 hover:bg-gray-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                {selectedIds.length < 3 && availablePolicies.length > 0 && (
                  <div className="w-full sm:w-64">
                    <Select onValueChange={addPolicy}>
                      <SelectTrigger>
                        <Plus className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Add Policy" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePolicies.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            <div className="flex items-center gap-2">
                              <span>{p.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {p.category}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {selectedPolicies.length >= 2 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="sticky left-0 z-10 bg-gray-50 px-4 py-4 text-left text-sm font-semibold text-foreground">
                        Feature
                      </th>
                      {selectedPolicies.map((p) => (
                        <th key={p.id} className="px-4 py-4 text-center">
                          <Badge variant="outline" className="mb-1 text-xs">
                            {p.planNumber}
                          </Badge>
                           <p className="text-sm font-bold text-foreground">{p.name}</p>
                           <p className="text-xs text-muted-foreground">{p.category}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <FeatureRow
                      label="Monthly Premium"
                      values={selectedPolicies.map((p) => p.monthlyPremium)}
                      type="currency"
                    />
                    <FeatureRow
                      label="Sum Assured"
                      values={selectedPolicies.map((p) => p.sumAssured)}
                      type="currency"
                    />
                    <FeatureRow
                      label="Policy Term"
                      values={selectedPolicies.map((p) => `${p.term} Years`)}
                    />
                    <FeatureRow
                      label="Maturity Benefit"
                      values={selectedPolicies.map((p) => p.maturityBenefit)}
                      type="currency"
                    />
                    <FeatureRow
                      label="Death Benefit"
                      values={selectedPolicies.map((p) => p.deathBenefit)}
                      type="currency"
                    />
                    <FeatureRow
                      label="Bonus Rate (/1000)"
                      values={selectedPolicies.map((p) =>
                        p.bonusRate > 0 ? `₹${p.bonusRate}` : "N/A"
                      )}
                    />
                    <FeatureRow
                      label="Loan Available"
                      values={selectedPolicies.map((p) => p.loanAvailable)}
                      type="boolean"
                    />
                    <FeatureRow
                      label="Partial Withdrawal"
                      values={selectedPolicies.map((p) => p.partialWithdrawal)}
                      type="boolean"
                    />
                    <FeatureRow
                      label="Critical Illness Rider"
                      values={selectedPolicies.map((p) => p.criticalIllness)}
                      type="boolean"
                    />
                    <FeatureRow
                      label="Accidental Benefit"
                      values={selectedPolicies.map((p) => p.accidentalBenefit)}
                      type="boolean"
                    />
                    <FeatureRow
                      label="Surrender Value"
                      values={selectedPolicies.map((p) => p.surrenderValue)}
                      type="boolean"
                    />
                    <FeatureRow
                      label="Free Look Period"
                      values={selectedPolicies.map((p) => p.freeLookPeriod)}
                      type="boolean"
                    />
                    <FeatureRow
                      label="Entry Age"
                      values={selectedPolicies.map(
                        (p) => `${p.minAge}-${p.maxAge} years`
                      )}
                    />
                    <FeatureRow
                      label="Tax Benefits"
                      values={selectedPolicies.map((p) => p.taxBenefits.join(", "))}
                    />
                  </tbody>
                </table>
              </div>
            </Card>

            {/* CTA */}
            <div className="mt-8 flex flex-col items-center gap-4 rounded-xl bg-primary p-8 text-center sm:flex-row sm:text-left">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">Ready to Decide?</h3>
                <p className="text-sm text-blue-200">
                  Get personalized recommendation based on your profile
                </p>
              </div>
              <Button asChild className="bg-amber-500 text-[#0a1628] hover:bg-amber-400">
                <Link to="/assessment">
                  Get Expert Help
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Shield className="mb-4 h-12 w-12 text-gray-300" />
              <h3 className="text-lg font-semibold text-foreground">
                Select at Least 2 Policies
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Add policies from the dropdown above to start comparing
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
