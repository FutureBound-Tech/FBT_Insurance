import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Users,
  IndianRupee,
  TrendingUp,
  BarChart3,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  Shield,
  Star,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn, formatCurrency } from "@/lib/utils";

interface UserProfile {
  fullName: string;
  age: number;
  gender: string;
  occupation: string;
  sector: string;
  maritalStatus: string;
  numberOfChildren: number;
  dependentParents: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  existingLifeInsurance: boolean;
  sumAssured?: number;
  preferredSumAssured: number;
  preferredTerm: number;
  monthlyBudget: number;
  priority: string;
}

interface PolicyRecommendation {
  id: string;
  name: string;
  planNumber: string;
  category: string;
  monthlyPremium: number;
  sumAssured: number;
  term: number;
  matchScore: number;
  highlights: string[];
  taxBenefits: string[];
  maturityBenefit?: number;
  deathBenefit?: number;
  bonusRate?: number;
}

const defaultProfile: UserProfile = {
  fullName: "User",
  age: 32,
  gender: "Male",
  occupation: "Software Engineer",
  sector: "IT",
  maritalStatus: "Married",
  numberOfChildren: 1,
  dependentParents: 2,
  monthlyIncome: 120000,
  monthlyExpenses: 60000,
  existingLifeInsurance: false,
  preferredSumAssured: 10000000,
  preferredTerm: 25,
  monthlyBudget: 5000,
  priority: "Highest Coverage",
};

const defaultRecommendations: PolicyRecommendation[] = [
  {
    id: "1",
    name: "LIC Tech Term",
    planNumber: "Plan 954",
    category: "Term",
    monthlyPremium: 2450,
    sumAssured: 10000000,
    term: 30,
    matchScore: 96,
    highlights: [
      "Pure term plan with lowest premium",
      "₹1 Cr coverage at just ₹2,450/month",
      "Critical illness rider available",
      "Online purchase discount",
    ],
    taxBenefits: ["Section 80C", "Section 10(10D)"],
    deathBenefit: 10000000,
  },
  {
    id: "2",
    name: "LIC Jeevan Anand",
    planNumber: "Plan 915",
    category: "Endowment",
    monthlyPremium: 8500,
    sumAssured: 2500000,
    term: 25,
    matchScore: 88,
    highlights: [
      "Double benefit: cover + savings",
      "Guaranteed maturity benefits",
      "Bonus additions every year",
      "Whole life coverage option",
    ],
    taxBenefits: ["Section 80C", "Section 10(10D)"],
    maturityBenefit: 4800000,
    deathBenefit: 2500000,
    bonusRate: 48,
  },
  {
    id: "3",
    name: "LIC New Jeevan Anand",
    planNumber: "Plan 935",
    category: "Endowment",
    monthlyPremium: 6200,
    sumAssured: 2000000,
    term: 20,
    matchScore: 82,
    highlights: [
      "Balanced protection and returns",
      "Flexible premium payment",
      "Loan facility available",
      "Guaranteed additions",
    ],
    taxBenefits: ["Section 80C", "Section 10(10D)"],
    maturityBenefit: 3600000,
    deathBenefit: 2000000,
    bonusRate: 42,
  },
  {
    id: "4",
    name: "LIC Amritbaal",
    planNumber: "Plan 974",
    category: "Children",
    monthlyPremium: 4800,
    sumAssured: 1500000,
    term: 18,
    matchScore: 75,
    highlights: [
      "Secures child's education",
      "Maturity at age 18",
      "Waiver of premium benefit",
      "Guaranteed additions",
    ],
    taxBenefits: ["Section 80C", "Section 10(10D)"],
    maturityBenefit: 2800000,
    deathBenefit: 1500000,
    bonusRate: 45,
  },
];

function ProfileSummary({ profile }: { profile: UserProfile }) {
  const idealCoverage = profile.monthlyIncome * 12 * 12;
  const currentCoverage = profile.sumAssured || 0;
  const coverageGap = Math.max(0, idealCoverage - currentCoverage);
  const coveragePercent = currentCoverage > 0 ? Math.min(100, (currentCoverage / idealCoverage) * 100) : 0;

  return (
    <Card className="border-[#1e3a5f]/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5 text-[#1e3a5f]" />
          Your Profile Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Personal Details</p>
              <p className="mt-1 text-base font-semibold text-gray-900">
                {profile.fullName}, {profile.age} yrs
              </p>
              <p className="text-sm text-gray-500">
                {profile.occupation} &middot; {profile.sector}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Family</p>
              <p className="mt-1 text-sm text-gray-700">
                {profile.maritalStatus} &middot; {profile.numberOfChildren} child
                {profile.numberOfChildren !== 1 ? "ren" : ""} &middot;{" "}
                {profile.dependentParents} dependent parent
                {profile.dependentParents !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Financial</p>
              <p className="mt-1 text-sm text-gray-700">
                Monthly Income:{" "}
                <span className="font-semibold">{formatCurrency(profile.monthlyIncome)}</span>
              </p>
              <p className="text-sm text-gray-700">
                Budget:{" "}
                <span className="font-semibold">{formatCurrency(profile.monthlyBudget)}/mo</span>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Priority</p>
              <Badge variant="secondary" className="mt-1">
                {profile.priority}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InsuranceGapAnalysis({
  profile,
  recommendations,
}: {
  profile: UserProfile;
  recommendations: PolicyRecommendation[];
}) {
  const idealCoverage = profile.monthlyIncome * 12 * 12;
  const currentCoverage = profile.sumAssured || 0;
  const recommendedCoverage = recommendations[0]?.sumAssured || 0;
  const coveragePercent = currentCoverage > 0 ? Math.min(100, (currentCoverage / idealCoverage) * 100) : 0;
  const recommendedPercent = Math.min(100, (recommendedCoverage / idealCoverage) * 100);
  const gap = Math.max(0, idealCoverage - currentCoverage);

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-amber-600" />
          Insurance Gap Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white/80 p-4 text-center">
            <p className="text-xs font-medium text-gray-500">Ideal Coverage</p>
            <p className="mt-1 text-xl font-bold text-[#1e3a5f]">
              {formatCurrency(idealCoverage)}
            </p>
            <p className="text-xs text-gray-400">12x annual income</p>
          </div>
          <div className="rounded-lg bg-white/80 p-4 text-center">
            <p className="text-xs font-medium text-gray-500">Current Coverage</p>
            <p className="mt-1 text-xl font-bold text-gray-700">
              {currentCoverage > 0 ? formatCurrency(currentCoverage) : "None"}
            </p>
            <p className="text-xs text-gray-400">
              {currentCoverage > 0 ? `${coveragePercent.toFixed(0)}%` : "No policy"}
            </p>
          </div>
          <div className="rounded-lg bg-white/80 p-4 text-center">
            <p className="text-xs font-medium text-gray-500">Coverage Gap</p>
            <p className="mt-1 text-xl font-bold text-red-600">{formatCurrency(gap)}</p>
            <p className="text-xs text-gray-400">Needs to be covered</p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-medium">
            <span className="text-gray-500">Current Coverage</span>
            <span className="text-gray-700">{coveragePercent.toFixed(0)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${coveragePercent}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full rounded-full bg-amber-500"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-medium">
            <span className="text-gray-500">With Recommended Policy</span>
            <span className="text-emerald-700">{recommendedPercent.toFixed(0)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${recommendedPercent}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full rounded-full bg-emerald-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PolicyCard({
  policy,
  index,
  onCompare,
  isComparing,
}: {
  policy: PolicyRecommendation;
  index: number;
  onCompare: (id: string) => void;
  isComparing: boolean;
}) {
  const isTop = index === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden transition-all hover:shadow-lg",
          isTop ? "border-amber-300 ring-2 ring-amber-200" : "border-gray-100"
        )}
      >
        {isTop && (
          <div className="absolute right-0 top-0">
            <div className="rounded-bl-lg bg-amber-500 px-3 py-1 text-xs font-bold text-[#0a1628]">
              Best Match
            </div>
          </div>
        )}

        <CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <Badge variant="outline" className="mb-2 text-xs">
                {policy.planNumber}
              </Badge>
              <h3 className="text-lg font-bold text-gray-900">{policy.name}</h3>
              <p className="text-sm text-gray-500">{policy.category} Plan</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-lg font-bold text-amber-600">{policy.matchScore}%</span>
              </div>
              <span className="text-xs text-gray-400">Match Score</span>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-3 rounded-lg bg-gray-50 p-3">
            <div className="text-center">
              <p className="text-xs text-gray-500">Monthly</p>
              <p className="text-sm font-bold text-gray-900">
                {formatCurrency(policy.monthlyPremium)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Coverage</p>
              <p className="text-sm font-bold text-gray-900">
                {formatCurrency(policy.sumAssured)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Term</p>
              <p className="text-sm font-bold text-gray-900">{policy.term} Years</p>
            </div>
          </div>

          {policy.maturityBenefit && (
            <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-700">
                  Estimated Maturity Benefit
                </span>
                <span className="text-base font-bold text-emerald-700">
                  {formatCurrency(policy.maturityBenefit)}
                </span>
              </div>
              {policy.bonusRate && (
                <p className="mt-1 text-xs text-emerald-600">
                  Bonus rate: ₹{policy.bonusRate}/1000 SA
                </p>
              )}
            </div>
          )}

          <div className="mb-4 space-y-1.5">
            {policy.highlights.slice(0, 3).map((h) => (
              <div key={h} className="flex items-start gap-2 text-sm text-gray-600">
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1e3a5f]" />
                <span>{h}</span>
              </div>
            ))}
          </div>

          <div className="mb-4 flex flex-wrap gap-1.5">
            {policy.taxBenefits.map((b) => (
              <Badge key={b} variant="secondary" className="text-xs">
                {b}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Button asChild className="flex-1" variant={isTop ? "default" : "outline"}>
              <Link to={`/assessment?policy=${policy.id}`}>
                Get This Plan
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCompare(policy.id)}
              className={cn(isComparing && "bg-blue-50 text-blue-600")}
            >
              {isComparing ? "Added" : "Compare"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Recommendations() {
  const navigate = useNavigate();
  const [profile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("assessment_profile");
    return saved ? JSON.parse(saved) : defaultProfile;
  });
  const [recommendations, setRecommendations] = useState<PolicyRecommendation[]>(() => {
    const saved = localStorage.getItem("assessment_recommendations");
    return saved ? JSON.parse(saved) : defaultRecommendations;
  });
  const [aiSummary, setAiSummary] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(true);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // Fetch AI recommendations on mount
  useEffect(() => {
    const fetchAI = async () => {
      try {
        const leadId = localStorage.getItem("assessment_lead_id");
        const res = await fetch("/api/ai/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId, profile }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.summary) setAiSummary(data.summary);
          if (data.recommendations?.length > 0) {
            const mapped = data.recommendations.map((r: any, i: number) => ({
              id: r.policyId || `ai-${i}`,
              name: r.policyName,
              planNumber: r.planNumber,
              category: r.categoryId || "Recommended",
              monthlyPremium: r.estimatedMonthlyPremium || 0,
              sumAssured: r.suggestedSumAssured || 5000000,
              term: r.suggestedTerm || 20,
              matchScore: r.matchScore || 70,
              highlights: r.reasons || [],
              taxBenefits: ["Section 80C", "Section 10(10D)"],
            }));
            setRecommendations(mapped);
          }
        }
      } catch {
        // Use default recommendations on error
      } finally {
        setAiLoading(false);
      }
    };
    fetchAI();
  }, []);

  const handleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-primary-light to-primary-dark py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Your Personalized Recommendations
            </h1>
            <p className="mt-3 text-blue-100 max-w-lg mx-auto">
              Based on your profile, here are the best LIC policies for you
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-6 pb-16">

        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <ProfileSummary profile={profile} />
          </motion.div>

          {/* AI Summary */}
          {(aiSummary || aiLoading) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="p-5 flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
                    <span className="text-sm">🤖</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">AI Advisor Insight</p>
                    {aiLoading ? (
                      <div className="space-y-2">
                        <div className="h-3 bg-primary/10 rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-primary/10 rounded animate-pulse w-1/2" />
                      </div>
                    ) : (
                      <p className="text-sm text-foreground">{aiSummary}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <InsuranceGapAnalysis profile={profile} recommendations={recommendations} />
          </motion.div>

          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recommended Policies</h2>
              {compareIds.length >= 2 && (
                <Button asChild variant="outline">
                  <Link to={`/compare?ids=${compareIds.join(",")}`}>
                    Compare Top {compareIds.length}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {recommendations.map((policy, idx) => (
                <PolicyCard
                  key={policy.id}
                  policy={policy}
                  index={idx}
                  onCompare={handleCompare}
                  isComparing={compareIds.includes(policy.id)}
                />
              ))}
            </div>
          </div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-[#1e3a5f] bg-gradient-to-r from-[#0a1628] to-[#1a3a5f]">
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">Get Expert Consultation</h3>
                  <p className="mt-1 text-sm text-blue-200">
                    Talk to a certified LIC agent for personalized guidance. Free of charge.
                  </p>
                </div>
                <Button asChild className="bg-amber-500 text-[#0a1628] hover:bg-amber-400">
                  <Link to="/thank-you">
                    <Phone className="mr-2 h-4 w-4" />
                    Request Callback
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
