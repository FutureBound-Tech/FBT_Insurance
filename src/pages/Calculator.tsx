import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator as CalcIcon,
  ArrowRight,
  ChevronLeft,
  Check,
  IndianRupee,
  Shield,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  planNumber: string;
  category: string;
  minAge: number;
  maxAge: number;
  ages: number[];
  terms: number[];
  minSumAssured: number;
  maxSumAssured: number;
  stepSumAssured: number;
  deathMultiplier: number;
  hasBonus: boolean;
  bonusRate: number;
  riders: string[];
}

const plans: Plan[] = [
  {
    id: "new-endowment-714", name: "New Endowment", planNumber: "Plan 714", category: "Endowment",
    minAge: 8, maxAge: 55, ages: Array.from({ length: 48 }, (_, i) => i + 8),
    terms: Array.from({ length: 24 }, (_, i) => i + 12),
    minSumAssured: 200000, maxSumAssured: 100000000, stepSumAssured: 50000,
    deathMultiplier: 1.0, hasBonus: true, bonusRate: 42, riders: ["ad-db", "term", "pwb"],
  },
  {
    id: "jeevan-anand-715", name: "Jeevan Anand", planNumber: "Plan 715", category: "Endowment",
    minAge: 18, maxAge: 50, ages: Array.from({ length: 33 }, (_, i) => i + 18),
    terms: Array.from({ length: 21 }, (_, i) => i + 15),
    minSumAssured: 200000, maxSumAssured: 100000000, stepSumAssured: 50000,
    deathMultiplier: 1.25, hasBonus: true, bonusRate: 42, riders: ["ad-db", "term"],
  },
  {
    id: "jeevan-labh-736", name: "Jeevan Labh", planNumber: "Plan 736", category: "Endowment",
    minAge: 8, maxAge: 59, ages: Array.from({ length: 52 }, (_, i) => i + 8),
    terms: [16, 21, 25],
    minSumAssured: 200000, maxSumAssured: 100000000, stepSumAssured: 50000,
    deathMultiplier: 1.0, hasBonus: true, bonusRate: 45, riders: ["ad-db", "term", "pwb"],
  },
  {
    id: "jeevan-umang-745", name: "Jeevan Umang", planNumber: "Plan 745", category: "Endowment",
    minAge: 8, maxAge: 55, ages: Array.from({ length: 48 }, (_, i) => i + 8),
    terms: Array.from({ length: 16 }, (_, i) => i + 15),
    minSumAssured: 200000, maxSumAssured: 100000000, stepSumAssured: 50000,
    deathMultiplier: 1.0, hasBonus: true, bonusRate: 48, riders: ["ad-db", "term", "pwb"],
  },
  {
    id: "term-954", name: "Tech Term", planNumber: "Plan 954", category: "Term",
    minAge: 18, maxAge: 65, ages: Array.from({ length: 48 }, (_, i) => i + 18),
    terms: Array.from({ length: 31 }, (_, i) => i + 10),
    minSumAssured: 2500000, maxSumAssured: 50000000, stepSumAssured: 250000,
    deathMultiplier: 1.0, hasBonus: false, bonusRate: 0, riders: [],
  },
  {
    id: "amritbaal-974", name: "Amritbaal", planNumber: "Plan 974", category: "Children",
    minAge: 0, maxAge: 13, ages: Array.from({ length: 14 }, (_, i) => i),
    terms: Array.from({ length: 8 }, (_, i) => i + 18),
    minSumAssured: 100000, maxSumAssured: 5000000, stepSumAssured: 25000,
    deathMultiplier: 1.0, hasBonus: true, bonusRate: 45, riders: ["ad-db", "pwb"],
  },
];

function getPremiumRate(age: number, term: number, category: string): number {
  if (category === "Term") {
    return age <= 25 ? 1.15 : age <= 30 ? 1.48 : age <= 35 ? 1.95 : age <= 40 ? 2.72 : age <= 45 ? 3.95 : age <= 50 ? 5.70 : age <= 55 ? 8.30 : age <= 60 ? 11.50 : 15.0;
  }
  if (category === "Children") return 26.5;
  const base = age <= 20 ? 29.5 : age <= 25 ? 31.5 : age <= 30 ? 34.0 : age <= 35 ? 37.0 : age <= 40 ? 40.5 : age <= 45 ? 45.0 : age <= 50 ? 50.5 : 56.5;
  return term >= 25 ? base * 0.92 : term >= 20 ? base * 0.95 : term >= 15 ? base * 0.97 : base;
}

interface ModeRow { label: string; premium: number; gst: number; total: number }
interface CalcResult {
  planDetails: { label: string; value: string }[];
  premiumRows: ModeRow[];
  totalPaid: number;
  sumAssured: number;
  bonus: number;
  fab: number;
  maturity: number | null;
  deathBenefit: number;
  hasDeathCover: boolean;
}

function compute(plan: Plan, age: number, term: number, sumAssured: number, riderADDB: boolean, riderTerm: boolean): CalcResult {
  const rate = getPremiumRate(age, term, plan.category);
  const baseAnnual = (sumAssured / 1000) * rate;
  const gst1 = Math.round(baseAnnual * 0.045);
  const gstN = Math.round(baseAnnual * 0.0225);
  const totalPaid = Math.round(baseAnnual + gst1 + (term - 1) * (baseAnnual + gstN));
  const modeFactors: Record<string, number> = { Yearly: 1, "Half-Yearly": 0.5065, Quarterly: 0.2575, Monthly: 0.0879 };
  const premiumRows: ModeRow[] = Object.entries(modeFactors).map(([label, f]) => {
    const prem = Math.round(baseAnnual * f);
    const gst = Math.round(prem * 0.045);
    return { label, premium: prem, gst, total: prem + gst };
  });
  const annualBonus = (sumAssured / 1000) * plan.bonusRate;
  const bonus = Math.round(annualBonus * term);
  const fab = plan.hasBonus ? Math.round(bonus * (term >= 25 ? 0.25 : term >= 20 ? 0.20 : term >= 15 ? 0.15 : 0.10)) : 0;
  const maturity = plan.hasBonus ? Math.round(sumAssured + bonus + fab) : null;
  const deathSA = sumAssured * plan.deathMultiplier;
  const deathBenefit = plan.hasBonus ? Math.round(deathSA + bonus + fab) : sumAssured;
  const planDetails = [
    { label: "Sum Assured", value: formatCurrency(sumAssured) },
    { label: "Age", value: `${age} Years` },
    { label: "Policy Term", value: `${term} Years` },
  ];
  if (plan.riders.includes("ad-db")) planDetails.push({ label: "AD & DB Rider", value: riderADDB ? "Yes" : "No" });
  if (plan.riders.includes("term")) planDetails.push({ label: "Term Rider", value: riderTerm ? "Yes" : "No" });
  return { planDetails, premiumRows, totalPaid, sumAssured, bonus, fab, maturity, deathBenefit, hasDeathCover: plan.category === "Endowment" || plan.category === "Children" };
}

export default function Calculator() {
  const [selectedId, setSelectedId] = useState("new-endowment-714");
  const [age, setAge] = useState("30");
  const [term, setTerm] = useState("20");
  const [sumAssured, setSumAssured] = useState("5000000");
  const [riderADDB, setRiderADDB] = useState(false);
  const [riderTerm, setRiderTerm] = useState(false);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [calculated, setCalculated] = useState(false);
  const plan = plans.find((p) => p.id === selectedId) || plans[0];

  const handleCalculate = useCallback(() => {
    const a = parseInt(age) || 30;
    const t = parseInt(term) || 20;
    const sa = parseInt(sumAssured) || 5000000;
    const r = compute(plan, a, t, sa, riderADDB, riderTerm);
    setResult(r);
    setCalculated(true);
  }, [plan, age, term, sumAssured, riderADDB, riderTerm]);

  const handleReset = () => { setCalculated(false); setResult(null); };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-white border-b">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="relative mx-auto max-w-4xl px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            {calculated && (
              <button onClick={handleReset} className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500">
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-accent shadow-lg shadow-blue-500/20">
                <CalcIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Insurance Calculator</h1>
                <p className="text-sm text-gray-500">Calculate premiums, maturity & death benefits</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <AnimatePresence mode="wait">
          {!calculated ? (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Plan Selector */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">Select Plan</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {plans.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedId(p.id); setCalculated(false); setResult(null); }}
                      className={cn(
                        "relative rounded-2xl border-2 p-4 text-left transition-all hover:shadow-sm",
                        selectedId === p.id
                          ? "border-blue-500 bg-blue-50/50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      )}
                    >
                      {selectedId === p.id && (
                        <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <Badge variant="outline" className="text-[10px] mb-2">{p.planNumber}</Badge>
                      <p className="text-sm font-bold text-gray-900 leading-tight">{p.name}</p>
                      <p className="text-[11px] text-gray-500 mt-1">{p.category}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Age (Years)</Label>
                    <Select value={age} onValueChange={setAge}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {plan.ages.map((a) => (<SelectItem key={a} value={String(a)}>{a} Years</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Policy Term</Label>
                    <Select value={term} onValueChange={setTerm}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {plan.terms.map((t) => (<SelectItem key={t} value={String(t)}>{t} Years</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Sum Assured</Label>
                  <Input
                    type="text"
                    value={Number(sumAssured).toLocaleString("en-IN")}
                    onChange={(e) => setSumAssured(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Enter Sum Assured"
                    className="h-11 rounded-xl text-base"
                  />
                  <p className="text-xs text-gray-400">
                    Min: {formatCurrency(plan.minSumAssured)} - Max: {formatCurrency(plan.maxSumAssured)}
                  </p>
                </div>

                {plan.riders.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Optional Riders</Label>
                    <div className="flex flex-wrap gap-3">
                      {plan.riders.includes("ad-db") && (
                        <label className={cn(
                          "flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all",
                          riderADDB ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:border-gray-300"
                        )}>
                          <input type="checkbox" checked={riderADDB} onChange={(e) => setRiderADDB(e.target.checked)} className="sr-only" />
                          <div className={cn("flex h-5 w-5 items-center justify-center rounded-md border-2", riderADDB ? "border-blue-500 bg-blue-500" : "border-gray-300")}>
                            {riderADDB && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">AD & DB Rider</p>
                            <p className="text-[11px] text-gray-500">Accidental Death & Disability</p>
                          </div>
                        </label>
                      )}
                      {plan.riders.includes("term") && (
                        <label className={cn(
                          "flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all",
                          riderTerm ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:border-gray-300"
                        )}>
                          <input type="checkbox" checked={riderTerm} onChange={(e) => setRiderTerm(e.target.checked)} className="sr-only" />
                          <div className={cn("flex h-5 w-5 items-center justify-center rounded-md border-2", riderTerm ? "border-blue-500 bg-blue-500" : "border-gray-300")}>
                            {riderTerm && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Term Rider</p>
                            <p className="text-[11px] text-gray-500">Additional term cover</p>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                )}

                <Button onClick={handleCalculate} variant="accent" className="w-full h-12 text-base rounded-xl">
                  <CalcIcon className="mr-2 h-5 w-5" />
                  Calculate Premium
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Plan Header */}
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="gradient-accent px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="text-[10px] mb-2 bg-white/20 text-white border-0">{plan.planNumber}</Badge>
                      <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                    </div>
                    <button onClick={handleReset} className="text-sm text-white/80 hover:text-white bg-white/10 px-4 py-2 rounded-lg transition-colors">
                      Recalculate
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="px-6 py-3 bg-gray-50/50">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Plan Details</h3>
                  </div>
                  {result?.planDetails.map((d, i) => (
                    <div key={i} className={cn("flex items-center justify-between px-6 py-3.5", i % 2 === 0 ? "" : "bg-gray-50/30")}>
                      <span className="text-sm text-gray-500">{d.label}</span>
                      <span className="text-sm font-bold text-gray-900">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Premium Table */}
              {result && (
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                  <div className="bg-emerald-600 px-6 py-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      Premium Details (GST Included)
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-emerald-50/50">
                          <th className="text-left px-6 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider">Mode</th>
                          <th className="text-right px-6 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider">Premium</th>
                          <th className="text-right px-6 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider">GST</th>
                          <th className="text-right px-6 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.premiumRows.map((row, i) => (
                          <tr key={i} className={cn("border-b last:border-0", i % 2 === 0 ? "" : "bg-gray-50/30")}>
                            <td className="px-6 py-3.5 text-sm font-semibold text-gray-900">{row.label}</td>
                            <td className="px-6 py-3.5 text-sm text-right text-gray-600">{formatCurrency(row.premium)}</td>
                            <td className="px-6 py-3.5 text-sm text-right text-gray-400">{formatCurrency(row.gst)}</td>
                            <td className="px-6 py-3.5 text-sm text-right font-bold text-emerald-600">{formatCurrency(row.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-3 bg-amber-50/50 border-t">
                    <p className="text-xs text-amber-700">
                      GST: 4.5% first year ({formatCurrency(Math.round(result.premiumRows[0].premium * 0.045))}) - 2.25% subsequent years
                    </p>
                  </div>
                </div>
              )}

              {/* Maturity Details */}
              {result && (
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                  <div className="bg-amber-500 px-6 py-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Maturity Details
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    <div className="flex items-center justify-between px-6 py-4">
                      <span className="text-sm text-gray-500">Total Paid Premium</span>
                      <span className="text-sm font-bold text-red-600">{formatCurrency(result.totalPaid)}</span>
                    </div>
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50/30">
                      <span className="text-sm text-gray-500">Basic Sum Assured</span>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(result.sumAssured)}</span>
                    </div>
                    {result.bonus > 0 && (
                      <div className="flex items-center justify-between px-6 py-4">
                        <span className="text-sm text-gray-500">Bonus (Approx)</span>
                        <span className="text-sm font-bold text-emerald-600">+ {formatCurrency(result.bonus)}</span>
                      </div>
                    )}
                    {result.fab > 0 && (
                      <div className="flex items-center justify-between px-6 py-4 bg-gray-50/30">
                        <span className="text-sm text-gray-500">FAB (Approx)</span>
                        <span className="text-sm font-bold text-emerald-600">+ {formatCurrency(result.fab)}</span>
                      </div>
                    )}
                    {result.maturity !== null ? (
                      <div className="flex items-center justify-between px-6 py-5 bg-emerald-50 border-t-2 border-emerald-200">
                        <span className="text-sm font-bold text-emerald-700">Total Maturity</span>
                        <span className="text-2xl font-extrabold text-emerald-700">{formatCurrency(result.maturity)}</span>
                      </div>
                    ) : (
                      <div className="px-6 py-5 bg-gray-50 border-t text-center">
                        <p className="text-sm text-gray-500">No maturity benefit for term plans</p>
                      </div>
                    )}
                    {result.hasDeathCover && result.maturity !== null && (
                      <div className="flex items-center justify-between px-6 py-5 bg-amber-50 border-t">
                        <div>
                          <span className="text-sm font-bold text-amber-700">Death Benefit</span>
                          <p className="text-xs text-amber-600 mt-0.5">{plan.deathMultiplier > 1 ? "125% of Basic SA + Bonus + FAB" : "SA + Bonus + FAB"}</p>
                        </div>
                        <span className="text-2xl font-extrabold text-amber-700">{formatCurrency(result.deathBenefit)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Summary */}
              {result && result.maturity !== null && (
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                  <div className="gradient-accent px-6 py-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Full Policy Summary
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
                        <p className="text-xs font-bold text-emerald-700 mb-3 uppercase tracking-wider">Maturity Benefit</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Total Paid</span>
                            <span className="font-bold text-red-600">- {formatCurrency(result.totalPaid)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Maturity</span>
                            <span className="font-bold text-emerald-600">+ {formatCurrency(result.maturity)}</span>
                          </div>
                          <div className="border-t border-emerald-200 pt-2 flex justify-between">
                            <span className="font-bold text-gray-900">Net Profit</span>
                            <span className={cn("font-extrabold text-xl", result.maturity - result.totalPaid >= 0 ? "text-emerald-600" : "text-red-600")}>
                              {formatCurrency(result.maturity - result.totalPaid)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5">
                        <p className="text-xs font-bold text-amber-700 mb-3 uppercase tracking-wider">Death Benefit</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Death Benefit</span>
                            <span className="font-bold text-amber-700">{formatCurrency(result.deathBenefit)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Surplus</span>
                            <span className="font-bold text-amber-600">+ {formatCurrency(result.deathBenefit - result.totalPaid)}</span>
                          </div>
                          <div className="border-t border-amber-200 pt-2 flex justify-between">
                            <span className="font-bold text-gray-900">Family Gets</span>
                            <span className="font-extrabold text-xl text-amber-700">{formatCurrency(result.deathBenefit)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="accent" className="flex-1 h-12 rounded-xl text-base">
                  <Link to="/assessment">
                    Get Personalized Quote
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleReset} className="h-12 rounded-xl">
                  Calculate Another
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
