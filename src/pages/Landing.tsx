import { useState, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Shield,
  Heart,
  TrendingUp,
  PiggyBank,
  Baby,
  Landmark,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowRight,
  Calculator,
  Star,
  Users,
  Award,
  Zap,
  Clock,
  IndianRupee,
  Bot,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 40 : 0,
      x: direction === "left" ? -40 : direction === "right" ? 40 : 0,
    },
    visible: { opacity: 1, y: 0, x: 0 },
  };
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const stats = [
  { value: "50K+", label: "Families Protected", icon: Users },
  { value: "500Cr+", label: "Sum Assured", icon: IndianRupee },
  { value: "98%", label: "Claim Settlement", icon: Award },
];

const steps = [
  {
    icon: Zap,
    title: "Share Your Profile",
    desc: "Quick 2-minute form about your family, income, and goals.",
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
  },
  {
    icon: Calculator,
    title: "Get Recommendations",
    desc: "We analyze and find the best LIC policies matched to your needs.",
    color: "bg-violet-500",
    lightColor: "bg-violet-50",
  },
  {
    icon: Shield,
    title: "Get Protected",
    desc: "Choose your plan and secure your family's financial future.",
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50",
  },
];

const policies = [
  { icon: Shield, name: "Term Insurance", desc: "Maximum coverage at lowest cost. Pure protection plan.", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100 hover:border-blue-200" },
  { icon: PiggyBank, name: "Endowment Plans", desc: "Insurance plus savings with guaranteed maturity benefits.", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100 hover:border-emerald-200" },
  { icon: TrendingUp, name: "ULIP Plans", desc: "Market-linked returns with life coverage. Grow wealth.", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100 hover:border-violet-200" },
  { icon: Landmark, name: "Pension Plans", desc: "Retirement planning with guaranteed regular pension.", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100 hover:border-amber-200" },
  { icon: Baby, name: "Children Plans", desc: "Secure your child's education and future milestones.", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100 hover:border-rose-200" },
  { icon: Heart, name: "Health Plans", desc: "Critical illness coverage and comprehensive health protection.", color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-100 hover:border-teal-200" },
];

const taxBenefits = [
  { section: "Section 80C", savings: "46,800", desc: "Deduction on life insurance premiums up to Rs 1.5L per year" },
  { section: "Section 80D", savings: "15,600", desc: "Additional deduction for health insurance premiums" },
  { section: "Section 10(10D)", savings: "100%", desc: "Maturity and death benefits are fully tax exempt" },
];

const faqs = [
  { q: "How much life insurance coverage do I need?", a: "The general rule is 10-15 times your annual income. Our assessment tool calculates the exact amount based on your liabilities, dependents, financial goals, and current savings." },
  { q: "What is LIC's claim settlement ratio?", a: "LIC maintains a 98%+ claim settlement ratio, the highest in India. This means 98 out of every 100 claims are settled, giving you complete peace of mind." },
  { q: "Can I buy LIC policy online through this platform?", a: "Yes! Start with our free assessment tool, get personalized recommendations, and our certified agent will guide you through documentation and policy issuance." },
  { q: "What happens if I miss a premium payment?", a: "LIC provides a 30-day grace period for yearly premiums. If the policy lapses, it can be revived within 5 years by paying pending premiums with interest." },
  { q: "Are LIC premiums eligible for tax deduction?", a: "Yes! Under Section 80C, you can claim up to Rs 1.5 lakh deduction on premiums. Under Section 10(10D), maturity proceeds are 100% tax-free if premium is within limits." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left hover:bg-gray-50/50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-800 pr-4">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm leading-relaxed text-gray-600">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero py-20 sm:py-28 lg:py-36">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-500/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-amber-500/3 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-1.5 text-xs font-medium text-blue-300 mb-8">
                <Star className="h-3 w-3" />
                Trusted by 50,000+ families across India
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Secure Your Family's{" "}
              <span className="text-gradient">Future Today</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg leading-relaxed text-gray-300 sm:text-xl max-w-2xl mx-auto"
            >
              Get personalized LIC policy recommendations in just 2 minutes.
              Answer a few questions, get the best plans matched to your profile.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Button
                asChild
                variant="gold"
                size="xl"
              >
                <Link to="/assessment">
                  Start Free Assessment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost-white"
                size="xl"
              >
                <Link to="/calculator">
                  <Calculator className="mr-2 h-5 w-5" />
                  Calculate Premium
                </Link>
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              100% Free &middot; No Spam &middot; No Obligation
            </motion.p>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mx-auto mt-20 grid max-w-3xl grid-cols-3 gap-4 sm:gap-6"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex flex-col items-center rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-6 text-center backdrop-blur-sm"
              >
                <s.icon className="mb-3 h-5 w-5 text-blue-400" />
                <span className="text-2xl sm:text-3xl font-bold text-white">{s.value}</span>
                <span className="text-xs text-gray-400 mt-1">{s.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* AI Advisor Section */}
      <AIPolicyAdvisor />

      {/* How It Works */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-4">
              How It Works
            </span>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Three Simple Steps
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Getting the right insurance plan has never been easier
            </p>
          </FadeIn>

          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <FadeIn key={step.title} delay={i * 0.15}>
                <div className="relative rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                  {i < steps.length - 1 && (
                    <div className="hidden sm:block absolute top-12 -right-4 w-8 border-t-2 border-dashed border-gray-200" />
                  )}
                  <div
                    className={cn(
                      "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl",
                      step.lightColor
                    )}
                  >
                    <step.icon className={cn("h-7 w-7", step.color.replace("bg-", "text-"))} />
                  </div>
                  <div className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Policy Categories */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <span className="inline-block rounded-full bg-violet-50 px-4 py-1.5 text-xs font-semibold text-violet-600 uppercase tracking-wider mb-4">
              Explore Plans
            </span>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Policy Categories
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Choose from a wide range of LIC plans for every life stage
            </p>
          </FadeIn>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {policies.map((p, i) => (
              <FadeIn key={p.name} delay={i * 0.08}>
                <Link
                  to="/calculator"
                  className={cn(
                    "group block rounded-2xl border bg-white p-6 transition-all hover:shadow-md",
                    p.border
                  )}
                >
                  <div className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-xl", p.bg)}>
                    <p.icon className={cn("h-6 w-6", p.color)} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-gray-700">
                    {p.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore Plan <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Tax Benefits */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <span className="inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-4">
              Tax Savings
            </span>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Save on Taxes
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Maximize your savings with LIC's tax benefits
            </p>
          </FadeIn>

          <div className="grid gap-6 sm:grid-cols-3">
            {taxBenefits.map((b, i) => (
              <FadeIn key={b.section} delay={i * 0.1}>
                <div className="relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 gradient-teal" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-3">
                    {b.section}
                  </p>
                  <p className="text-3xl font-extrabold text-gray-900 mb-2">
                    {b.section === "Section 10(10D)" ? `${b.savings} Tax Free` : `Save Rs ${b.savings}`}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Social Proof */}
      <section className="py-20 sm:py-28 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 relative">
          <FadeIn>
            <div className="rounded-3xl card-glass p-8 sm:p-12 shadow-2xl border border-white/10 text-center">
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <blockquote className="text-xl sm:text-2xl font-medium text-white leading-relaxed mb-6">
                "FBT Insurance helped me find the perfect LIC plan for my family.
                The FBT recommendations were spot on, and the process was incredibly smooth.
                Highly recommended!"
              </blockquote>
              <div>
                <p className="font-semibold text-amber-400">Rajesh Kumar</p>
                <p className="text-sm text-gray-400">Software Engineer, Bangalore</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <FadeIn>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-2 mb-8">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-300">Limited time offer</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
              Every day you delay,<br />premiums increase
            </h2>
            <p className="mt-6 text-lg text-gray-300 max-w-xl mx-auto">
              Lock in today's rates. Our free assessment takes just 2 minutes and could save you lakhs.
            </p>
            <Button
              asChild
              variant="gold"
              size="xl"
              className="mt-10 shadow-xl shadow-amber-500/20"
            >
              <Link to="/assessment">
                Start Free Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FadeIn className="text-center mb-12">
            <span className="inline-block rounded-full bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-4">
              FAQ
            </span>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Common Questions
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              {faqs.map((f) => (
                <FAQItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}

function AIPolicyAdvisor() {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("");
  const [age, setAge] = useState("");
  const [budget, setBudget] = useState("");
  const [result, setResult] = useState<{ plan: string; desc: string } | null>(null);

  const handleGoal = (selected: string) => { setGoal(selected); setStep(2); };
  const handleAge = (selected: string) => { setAge(selected); setStep(3); };
  const handleBudget = (selected: string) => { 
    setBudget(selected); 
    // Calculate recommendation
    let plan = "Endowment Plan (Jeevan Anand)";
    let desc = "A great balance of life cover and guaranteed savings for your future.";
    if (goal === "protection") {
      plan = "Tech Term Plan (954)";
      desc = "Maximum coverage for your family at the lowest premium. Pure protection.";
    } else if (goal === "child") {
      plan = "Amritbaal / Jeevan Tarun";
      desc = "Designed specifically to secure your child's education and future milestones.";
    } else if (goal === "retirement") {
      plan = "Jeevan Umang (745)";
      desc = "Whole life insurance with 8% guaranteed regular income after premium paying term.";
    }
    setResult({ plan, desc });
    setStep(4);
  };

  const reset = () => { setStep(1); setGoal(""); setAge(""); setBudget(""); setResult(null); };

  return (
    <section className="py-20 sm:py-28 gradient-ai relative overflow-hidden text-white border-y border-white/10">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-purple-500/10 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-medium text-purple-200 mb-6">
            <Sparkles className="h-4 w-4 text-purple-300" />
            FBT Policy Advisor
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl">
            Let FBT find your perfect plan
          </h2>
          <p className="mt-4 text-lg text-purple-200 max-w-2xl mx-auto">
            Answer 3 quick questions and FBT will recommend the exact LIC policy for your needs.
          </p>
        </div>

        <div className="card-glass rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
            <div 
              className="h-full gradient-gold transition-all duration-500" 
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="text-xl font-semibold text-center mb-6">What is your primary goal?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: "protection", label: "Family Protection", icon: Shield },
                    { id: "savings", label: "Savings & Growth", icon: TrendingUp },
                    { id: "child", label: "Child's Future", icon: Baby },
                    { id: "retirement", label: "Retirement Planning", icon: Landmark },
                  ].map(item => (
                    <button key={item.id} onClick={() => handleGoal(item.id)} className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all text-left group">
                      <div className="p-3 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                        <item.icon className="h-6 w-6 text-purple-300" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="text-xl font-semibold text-center mb-6">What is your age group?</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {["18-25", "26-35", "36-45", "46+"].map(a => (
                    <button key={a} onClick={() => handleAge(a)} className="p-6 rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all text-center font-medium text-lg">
                      {a}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="text-xl font-semibold text-center mb-6">What is your yearly budget?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: "low", label: "Under ₹50k" },
                    { id: "med", label: "₹50k - ₹1.5L" },
                    { id: "high", label: "Above ₹1.5L" },
                  ].map(b => (
                    <button key={b.id} onClick={() => handleBudget(b.id)} className="p-6 rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all text-center font-medium">
                      {b.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && result && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-4">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 mb-2">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-sm uppercase tracking-widest text-purple-300 font-semibold mb-2">FBT Recommendation</h3>
                  <p className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text gradient-gold mb-4 inline-block">{result.plan}</p>
                  <p className="text-purple-100 max-w-lg mx-auto">{result.desc}</p>
                </div>
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild variant="gold" size="lg">
                    <Link to="/assessment">
                      Get Exact Quote
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="ghost-white" size="lg" onClick={reset}>
                    Start Over
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
