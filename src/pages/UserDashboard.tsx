import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  Shield,
  User,
  TrendingUp,
  BarChart3,
  ArrowRight,
  Calculator,
  RefreshCw,
  Phone,
  ChevronRight,
  Star,
  Clock,
  Target,
  IndianRupee,
  LogOut,
  Award,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";

interface UserProfile {
  fullName: string;
  phone: string;
  email?: string;
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
  preferredSumAssured: number;
  preferredTerm: number;
  monthlyBudget: number;
  priority: string;
  healthStatus: string;
  riskAppetite: string;
}

interface Recommendation {
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
}

// Sector benchmarks - hardcoded + real mix
const sectorBenchmarks: Record<string, { label: string; term: number; endowment: number; ulip: number; pension: number; health: number; avgCoverage: number }> = {
  IT: { label: "IT & Technology", term: 68, endowment: 42, ulip: 35, pension: 22, health: 78, avgCoverage: 8500000 },
  Banking: { label: "Banking & Finance", term: 72, endowment: 58, ulip: 41, pension: 52, health: 82, avgCoverage: 12000000 },
  Government: { label: "Government Sector", term: 45, endowment: 62, ulip: 18, pension: 78, health: 88, avgCoverage: 6000000 },
  Healthcare: { label: "Healthcare", term: 55, endowment: 48, ulip: 25, pension: 35, health: 92, avgCoverage: 7000000 },
  Education: { label: "Education", term: 52, endowment: 55, ulip: 22, pension: 48, health: 75, avgCoverage: 5500000 },
  Manufacturing: { label: "Manufacturing", term: 60, endowment: 42, ulip: 28, pension: 32, health: 70, avgCoverage: 6500000 },
  Retired: { label: "Retired", term: 25, endowment: 70, ulip: 15, pension: 85, health: 95, avgCoverage: 3000000 },
};

function FadeIn({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.4, delay, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

function AnimatedBar({ percent, color, delay = 0 }: { percent: number; color: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={isInView ? { width: `${percent}%` } : { width: 0 }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
        className={cn("h-full rounded-full", color)}
      />
    </div>
  );
}

const greetings = [
  "Good morning",
  "Good afternoon",
  "Good evening",
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(true);
  const [assessmentDate, setAssessmentDate] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("assessment_profile");
    if (!stored) {
      navigate("/assessment");
      return;
    }
    setProfile(JSON.parse(stored));

    const recs = localStorage.getItem("assessment_recommendations");
    if (recs) setRecommendations(JSON.parse(recs));

    const ts = localStorage.getItem("assessment_timestamp");
    if (ts) {
      const d = new Date(parseInt(ts));
      setAssessmentDate(d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }));
    }

    // Fetch AI summary
    const fetchAI = async () => {
      try {
        const leadId = localStorage.getItem("assessment_lead_id");
        const res = await fetch("/api/ai/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId, profile: JSON.parse(stored!) }),
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
            localStorage.setItem("assessment_recommendations", JSON.stringify(mapped));
          }
        }
      } catch { /* use existing data */ }
      finally { setAiLoading(false); }
    };
    fetchAI();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("assessment_profile");
    localStorage.removeItem("assessment_recommendations");
    localStorage.removeItem("assessment_lead_id");
    localStorage.removeItem("assessment_timestamp");
    navigate("/");
  };

  if (!profile) return null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? greetings[0] : hour < 17 ? greetings[1] : greetings[2];
  const sector = sectorBenchmarks[profile.sector] || sectorBenchmarks.IT;
  const idealCoverage = profile.monthlyIncome * 12 * 12;
  const currentCoverage = profile.existingLifeInsurance ? profile.preferredSumAssured * 0.3 : 0;
  const recommendedCoverage = recommendations[0]?.sumAssured || profile.preferredSumAssured;
  const coveragePercent = idealCoverage > 0 ? Math.min(100, ((currentCoverage + recommendedCoverage) / idealCoverage) * 100) : 0;
  const taxSavings = Math.min(46800, Math.round((recommendations[0]?.monthlyPremium || profile.monthlyBudget) * 12 * 0.3));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[400px] w-[400px] rounded-full bg-blue-500/8 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200 mb-1">{greeting},</p>
                <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
                  {profile.fullName}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-300">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" />{profile.age} yrs &middot; {profile.gender}</span>
                  <span className="flex items-center gap-1"><Shield className="h-3 w-3" />{profile.occupation}</span>
                  {assessmentDate && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Assessed on {assessmentDate}</span>}
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/assessment" className="flex items-center gap-1.5 rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/20 transition-colors">
                  <RefreshCw className="h-3.5 w-3.5" /> Re-assess
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-red-500/20 hover:text-red-300 transition-colors">
                  <LogOut className="h-3.5 w-3.5" /> Logout
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 -mt-5 pb-16 sm:px-6 lg:px-8">
        {/* AI Insight */}
        {(aiSummary || aiLoading) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-violet-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shrink-0 mt-0.5">
                  <Award className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">AI Advisor Insight</p>
                  {aiLoading ? (
                    <div className="space-y-2">
                      <div className="h-3 bg-blue-100 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-blue-100 rounded animate-pulse w-1/2" />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed">{aiSummary}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Coverage Summary */}
            <FadeIn>
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                    <Target className="h-5 w-5 text-blue-600" />
                    Coverage Analysis
                  </h2>
                  <Badge variant="outline" className="text-xs">{profile.priority}</Badge>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 rounded-xl bg-gray-50">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ideal</p>
                      <p className="mt-1 text-lg font-extrabold text-gray-900">{formatCurrency(idealCoverage)}</p>
                      <p className="text-[10px] text-gray-400">12x annual income</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-blue-50">
                      <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Recommended</p>
                      <p className="mt-1 text-lg font-extrabold text-blue-700">{formatCurrency(recommendedCoverage)}</p>
                      <p className="text-[10px] text-blue-500">Best plan for you</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-emerald-50">
                      <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">With Plan</p>
                      <p className="mt-1 text-lg font-extrabold text-emerald-700">{coveragePercent.toFixed(0)}%</p>
                      <p className="text-[10px] text-emerald-500">Coverage achieved</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-gray-500">Coverage Progress</span>
                      <span className="text-gray-700">{coveragePercent.toFixed(0)}%</span>
                    </div>
                    <AnimatedBar percent={coveragePercent} color="bg-gradient-to-r from-blue-500 to-emerald-500" />
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Recommended Policies */}
            <FadeIn delay={0.1}>
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Your Recommended Policies
                  </h2>
                  {recommendations.length > 2 && (
                    <Link to="/compare" className="text-xs font-medium text-blue-600 hover:underline">Compare All</Link>
                  )}
                </div>
                <div className="divide-y divide-gray-50">
                  {recommendations.length > 0 ? recommendations.slice(0, 4).map((rec, i) => (
                    <div key={rec.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px]">{rec.planNumber}</Badge>
                            {i === 0 && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Best Match</span>}
                          </div>
                          <h3 className="text-sm font-bold text-gray-900">{rec.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{rec.category} Plan</p>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                            <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />{formatCurrency(rec.monthlyPremium)}/mo</span>
                            <span className="flex items-center gap-1"><Shield className="h-3 w-3" />{formatCurrency(rec.sumAssured)} cover</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{rec.term} years</span>
                          </div>
                          {rec.highlights.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {rec.highlights.slice(0, 2).map((h) => (
                                <span key={h} className="text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">{h}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="text-lg font-extrabold text-amber-600">{rec.matchScore}%</span>
                          </div>
                          <span className="text-[10px] text-gray-400">match</span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="px-6 py-10 text-center">
                      <p className="text-sm text-gray-400">Loading recommendations...</p>
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                  <Link to="/calculator" className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                    <Calculator className="h-4 w-4" />
                    Calculate exact premiums
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Tax Savings */}
            <FadeIn delay={0.15}>
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                    <IndianRupee className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-bold text-emerald-800">Tax Savings</h3>
                </div>
                <p className="text-2xl font-extrabold text-emerald-700">Save up to {formatCurrency(taxSavings)}/yr</p>
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />Section 80C: Up to Rs 1.5L deduction
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />Section 10(10D): Maturity tax-free
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Sector Insights */}
            <FadeIn delay={0.2}>
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <Users className="h-4 w-4 text-violet-600" />
                    {sector.label} Insights
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { label: "Term Insurance", pct: sector.term, color: "bg-blue-500" },
                    { label: "Endowment Plans", pct: sector.endowment, color: "bg-emerald-500" },
                    { label: "ULIP", pct: sector.ulip, color: "bg-violet-500" },
                    { label: "Pension Plans", pct: sector.pension, color: "bg-amber-500" },
                    { label: "Health Cover", pct: sector.health, color: "bg-rose-500" },
                  ].map((item, i) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 font-medium">{item.label}</span>
                        <span className="font-bold text-gray-900">{item.pct}%</span>
                      </div>
                      <AnimatedBar percent={item.pct} color={item.color} delay={i * 0.1} />
                    </div>
                  ))}
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">{sector.term}%</span> of {sector.label.toLowerCase()} professionals have term insurance. Average coverage: <span className="font-semibold text-gray-700">{formatCurrency(sector.avgCoverage)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Quick Actions */}
            <FadeIn delay={0.25}>
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900">Quick Actions</h3>
                </div>
                <div className="p-3 space-y-1">
                  {[
                    { icon: Calculator, label: "Premium Calculator", to: "/calculator", desc: "Calculate exact premiums" },
                    { icon: BarChart3, label: "Compare Policies", to: "/compare", desc: "Side-by-side comparison" },
                    { icon: RefreshCw, label: "Re-take Assessment", to: "/assessment", desc: "Update your profile" },
                    { icon: Phone, label: "Request Callback", to: "/thank-you", desc: "Talk to an expert" },
                  ].map((action) => (
                    <Link key={action.label} to={action.to} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-gray-50 transition-colors group">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-blue-50 transition-colors">
                        <action.icon className="h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                        <p className="text-[10px] text-gray-400">{action.desc}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Profile Summary */}
            <FadeIn delay={0.3}>
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <User className="h-4 w-4 text-gray-500" />
                    Your Profile
                  </h3>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label: "Family", value: `${profile.maritalStatus} &middot; ${profile.numberOfChildren} child${profile.numberOfChildren !== 1 ? "ren" : ""} &middot; ${profile.dependentParents} dependent${profile.dependentParents !== 1 ? "s" : ""}` },
                    { label: "Income", value: formatCurrency(profile.monthlyIncome) + "/month" },
                    { label: "Budget", value: formatCurrency(profile.monthlyBudget) + "/month" },
                    { label: "Health", value: profile.healthStatus },
                    { label: "Risk Appetite", value: profile.riskAppetite },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">{item.label}</span>
                      <span className="text-xs font-semibold text-gray-700" dangerouslySetInnerHTML={{ __html: item.value }} />
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="mt-6 flex gap-3 sm:hidden">
          <Link to="/assessment" className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700">
            <RefreshCw className="h-4 w-4" /> Re-assess
          </Link>
          <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
