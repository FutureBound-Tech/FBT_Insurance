import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Phone,
  MessageCircle,
  Clock,
  FileText,
  Shield,
  Share2,
  Copy,
  ArrowRight,
  User,
  Calendar,
  Star,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";

interface LeadSummary {
  name: string;
  phone: string;
  email?: string;
  age: number;
  occupation: string;
  preferredCoverage: number;
  monthlyBudget: number;
  preferredPolicy?: string;
  whatsappOptin: boolean;
}

const defaultSummary: LeadSummary = {
  name: "User", phone: "XXXXXXXXXX", email: "", age: 32,
  occupation: "Software Engineer", preferredCoverage: 10000000,
  monthlyBudget: 5000, preferredPolicy: "LIC Tech Term", whatsappOptin: true,
};

const nextSteps = [
  { icon: Phone, title: "Expert Call", description: "Our certified LIC agent will call you within 2 hours to discuss your requirements.", time: "Within 2 hours" },
  { icon: FileText, title: "Personalized Quote", description: "You'll receive a detailed quote with exact premium calculations and benefits.", time: "Within 24 hours" },
  { icon: Shield, title: "Policy Issuance", description: "Complete documentation and get your policy issued quickly with our guidance.", time: "2-3 business days" },
  { icon: Star, title: "Ongoing Support", description: "Dedicated support for premium payments, claims, and any policy-related queries.", time: "Lifetime" },
];

const checkmarkVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1, opacity: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 15, delay: 0.2 },
  },
};

const circleVariants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 20 },
  },
};

export default function ThankYou() {
  const [summary] = useState<LeadSummary>(() => {
    const saved = localStorage.getItem("lead_summary");
    return saved ? JSON.parse(saved) : defaultSummary;
  });
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareText = `I just completed my LIC insurance assessment! Get personalized policy recommendations at ${shareUrl}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = `https://wa.me/91${summary.phone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent("Hi! I just completed my LIC insurance assessment. I'd like to discuss my options.")}`;

  return (
    <div className="min-h-screen bg-gray-50 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Success */}
        <motion.div initial="hidden" animate="visible" className="mb-10 flex flex-col items-center text-center">
          <motion.div variants={circleVariants} className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 shadow-lg shadow-emerald-500/10">
            <motion.div variants={checkmarkVariants}>
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            </motion.div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Thank You for Your Interest!
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-4 text-lg text-gray-600">
            Our expert will contact you within 2 hours
          </motion.p>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-100 px-4 py-2 text-sm font-medium text-amber-700">
            <Clock className="h-4 w-4" />
            Expected callback: Within 2 hours
          </motion.div>
        </motion.div>

        {/* Lead Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <div className="mb-8 rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <User className="h-5 w-5 text-blue-600" />
                Your Submission Summary
              </h2>
            </div>
            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <div><p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Name</p><p className="text-sm font-bold text-gray-900">{summary.name}</p></div>
                  <div><p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</p><p className="text-sm font-bold text-gray-900">{summary.phone}</p>{summary.email && <p className="text-xs text-gray-500">{summary.email}</p>}</div>
                </div>
                <div className="space-y-3">
                  <div><p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Coverage Needed</p><p className="text-sm font-bold text-gray-900">{formatCurrency(summary.preferredCoverage)}</p></div>
                  <div><p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Monthly Budget</p><p className="text-sm font-bold text-gray-900">{formatCurrency(summary.monthlyBudget)}</p></div>
                  {summary.preferredPolicy && <div><p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Interested In</p><Badge variant="secondary" className="mt-0.5">{summary.preferredPolicy}</Badge></div>}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <div className="mb-8 rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <Calendar className="h-5 w-5 text-blue-600" />
                What Happens Next?
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {nextSteps.map((step, idx) => (
                  <div key={step.title} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", idx === 0 ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400")}>
                        <step.icon className="h-5 w-5" />
                      </div>
                      {idx < nextSteps.length - 1 && <div className="mt-2 h-full min-h-[24px] w-0.5 bg-gray-200" />}
                    </div>
                    <div className="pb-6">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">{step.title}</h3>
                        <Badge variant="outline" className="text-xs">{step.time}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mb-8 grid gap-4 sm:grid-cols-2">
          {summary.whatsappOptin && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50">
              <div className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-emerald-800">Chat on WhatsApp</h3>
                  <p className="text-xs text-emerald-600">Get instant responses</p>
                </div>
                <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 rounded-lg">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Chat <ExternalLink className="ml-1 h-3 w-3" /></a>
                </Button>
              </div>
            </div>
          )}
          <div className={cn("rounded-2xl border border-gray-100 bg-white", !summary.whatsappOptin && "sm:col-span-2")}>
            <div className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900">Explore More Policies</h3>
                <p className="text-xs text-gray-500">Browse our complete catalog</p>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-lg">
                <Link to="/calculator">Explore <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Social */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <Share2 className="h-5 w-5 text-gray-400" />
              <p className="flex-1 text-sm text-gray-500">Help your friends and family secure their future too</p>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" asChild className="rounded-full h-9 w-9">
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-9 w-9" onClick={copyLink}>
                  {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="mt-8 text-center">
          <Link to="/" className="text-sm font-medium text-blue-600 hover:underline">&larr; Back to Home</Link>
        </motion.div>
      </div>
    </div>
  );
}
