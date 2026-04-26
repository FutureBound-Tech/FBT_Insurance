import { motion } from "framer-motion";
import { ClipboardCheck, Shield, Lock } from "lucide-react";
import AssessmentWizard from "@/components/assessment/AssessmentWizard";

export default function Assessment() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative overflow-hidden bg-white border-b">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="relative mx-auto max-w-5xl px-4 py-14 sm:py-16 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 shadow-sm">
              <ClipboardCheck className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Free Insurance Assessment
            </h1>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto text-lg">
              Answer a few questions and get personalized LIC policy recommendations
            </p>
            <div className="mt-5 inline-flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700">
                <Shield className="h-3 w-3" />
                Your data is secure
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500">
                <Lock className="h-3 w-3" />
                Never shared
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-4 pb-16">
        <AssessmentWizard />
      </div>
    </div>
  );
}
