import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import StepPersonal from "./StepPersonal";
import StepFamily from "./StepFamily";
import StepFinancial from "./StepFinancial";
import StepHealth from "./StepHealth";
import StepGoals from "./StepGoals";

const personalSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  email: z.union([z.string().email("Invalid email"), z.literal("")]).optional(),
  age: z.coerce.number().int().min(18, "Minimum age is 18").max(80, "Maximum age is 80"),
  gender: z.enum(["Male", "Female", "Other"], { error: "Gender is required" }),
  occupation: z.enum(
    [
      "Software Engineer", "Manager", "Business Owner", "Banker",
      "Government Officer", "Doctor", "Lawyer", "Teacher", "Accountant", "Others",
    ],
    { error: "Occupation is required" }
  ),
  companyName: z.string().optional(),
  sector: z.enum(
    ["IT", "Banking", "Government", "Healthcare", "Education", "Manufacturing", "Retired", "Others"],
    { error: "Sector is required" }
  ),
});

const familySchema = z.object({
  maritalStatus: z.enum(["Single", "Married", "Divorced", "Widowed"], {
    error: "Marital status is required",
  }),
  numberOfChildren: z.coerce.number().int().min(0).max(10).default(0),
  childrenAges: z.array(z.coerce.number().int().min(0).max(40)).optional(),
  dependentParents: z.coerce.number().int().min(0).max(4).default(0),
  spouseWorking: z.boolean().default(false),
  spouseIncome: z.coerce.number().min(0).optional(),
});

const financialSchema = z.object({
  monthlyIncome: z.coerce.number().min(1, "Monthly income is required"),
  monthlyExpenses: z.coerce.number().min(1, "Monthly expenses is required"),
  existingLifeInsurance: z.boolean().default(false),
  insuranceType: z.enum(["Term", "Endowment", "ULIP", "Group", "None"]).optional(),
  insuranceProvider: z.string().optional(),
  sumAssured: z.coerce.number().min(0).optional(),
  annualPremium: z.coerce.number().min(0).optional(),
  investmentGoals: z.array(z.string()).min(1, "Select at least one goal"),
  riskAppetite: z.enum(["Conservative", "Moderate", "Aggressive"], {
    error: "Risk appetite is required",
  }),
});

const healthSchema = z.object({
  healthStatus: z.enum(["Excellent", "Good", "Average", "Below Average"], {
    error: "Health status is required",
  }),
  smoking: z.boolean().default(false),
  drinking: z.boolean().default(false),
  chronicDisease: z.boolean().default(false),
  chronicDiseaseDetails: z.string().optional(),
  familyMedicalHistory: z.array(z.string()).min(1, "Select at least one option"),
});

const goalsSchema = z.object({
  preferredSumAssured: z.coerce.number().min(200000).max(50000000),
  preferredTerm: z.coerce.number().int().min(5).max(40),
  monthlyBudget: z.coerce.number().min(500, "Minimum budget is ₹500"),
  priority: z.enum(["Highest Coverage", "Best Returns", "Balanced", "Low Premium"], {
    error: "Priority is required",
  }),
  preferredContactTime: z.enum(["Morning", "Afternoon", "Evening", "Anytime"]).optional(),
  whatsappOptin: z.boolean().default(false),
  additionalNotes: z.string().optional(),
});

const fullSchema = personalSchema
  .and(familySchema)
  .and(financialSchema)
  .and(healthSchema)
  .and(goalsSchema);

type AssessmentFormData = z.input<typeof fullSchema>;

const stepSchemaFields: Record<number, string[]> = {
  0: ["fullName", "phone", "email", "age", "gender", "occupation", "companyName", "sector"],
  1: ["maritalStatus", "numberOfChildren", "childrenAges", "dependentParents", "spouseWorking", "spouseIncome"],
  2: ["monthlyIncome", "monthlyExpenses", "existingLifeInsurance", "insuranceType", "insuranceProvider", "sumAssured", "annualPremium", "investmentGoals", "riskAppetite"],
  3: ["healthStatus", "smoking", "drinking", "chronicDisease", "chronicDiseaseDetails", "familyMedicalHistory"],
  4: ["preferredSumAssured", "preferredTerm", "monthlyBudget", "priority", "preferredContactTime", "whatsappOptin", "additionalNotes"],
};

const steps = [
  { title: "Personal", description: "Basic information" },
  { title: "Family", description: "Family details" },
  { title: "Financial", description: "Income & goals" },
  { title: "Health", description: "Health profile" },
  { title: "Goals", description: "Insurance preferences" },
] as const;

const stepComponents = [StepPersonal, StepFamily, StepFinancial, StepHealth, StepGoals];

const pageVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function AssessmentWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const methods = useForm<AssessmentFormData>({
    resolver: zodResolver(fullSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      age: undefined,
      gender: undefined,
      occupation: undefined,
      companyName: "",
      sector: undefined,
      maritalStatus: undefined,
      numberOfChildren: 0,
      childrenAges: [],
      dependentParents: 0,
      spouseWorking: false,
      spouseIncome: undefined,
      monthlyIncome: undefined,
      monthlyExpenses: undefined,
      existingLifeInsurance: false,
      insuranceType: undefined,
      insuranceProvider: "",
      sumAssured: undefined,
      annualPremium: undefined,
      investmentGoals: [],
      riskAppetite: undefined,
      healthStatus: undefined,
      smoking: false,
      drinking: false,
      chronicDisease: false,
      chronicDiseaseDetails: "",
      familyMedicalHistory: [],
      preferredSumAssured: 1000000,
      preferredTerm: 20,
      monthlyBudget: undefined,
      priority: undefined,
      preferredContactTime: undefined,
      whatsappOptin: false,
      additionalNotes: "",
    },
  });

  const { handleSubmit, trigger, getValues } = methods;

  const progress = ((currentStep + 1) / steps.length) * 100;

  const goNext = async () => {
    const fields = stepSchemaFields[currentStep] as Array<keyof AssessmentFormData>;
    const isValid = await trigger(fields);
    if (!isValid) return;

    // Capture partial lead (name + phone) when leaving page 1
    if (currentStep === 0) {
      const { fullName, phone } = getValues();
      if (fullName && phone) {
        try {
          await fetch("/api/assessment/capture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullName, phone }),
          });
        } catch {
          // Silent fail — don't block user flow
        }
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const goToStep = async (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    } else if (step === currentStep + 1) {
      await goNext();
    }
  };

  const onSubmit = async (data: AssessmentFormData) => {
    if (currentStep < steps.length - 1) {
      await goNext();
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const result = await response.json();

        // Save lead ID and profile for AI recommendations
        if (result.lead?.id) {
          localStorage.setItem("assessment_lead_id", result.lead.id);
        }
        localStorage.setItem("assessment_profile", JSON.stringify(data));
        localStorage.setItem("assessment_timestamp", Date.now().toString());
        if (result.recommendations?.length > 0) {
          localStorage.setItem(
            "assessment_recommendations",
            JSON.stringify(
              result.recommendations.map((r: any) => ({
                id: r.policyId || r.id,
                name: r.policy?.name || r.policyName || "",
                planNumber: r.policy?.planNumber || r.planNumber || "",
                category: r.policy?.category?.name || r.category || "",
                monthlyPremium: r.estimatedMonthlyPremium || 0,
                sumAssured: r.recommendedSumAssured || 0,
                term: r.recommendedTerm || 0,
                matchScore: r.matchScore || 0,
                highlights: r.matchReasons || [],
                taxBenefits: ["Section 80C", "Section 10(10D)"],
              }))
            )
          );
        }

        setSubmitted(true);
      }
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = stepComponents[currentStep];

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Submitted!</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            We've analyzed your profile and are generating personalized LIC policy recommendations for you.
          </p>
          <Button onClick={() => (window.location.href = "/dashboard")} variant="accent" className="rounded-xl">
            Go to Your Dashboard
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            {/* Step Indicator */}
            <div className="border-b border-gray-100 bg-gray-50/50 p-4 sm:p-6">
              <div className="flex items-center justify-between relative">
                {steps.map((step, index) => (
                  <div key={step.title} className="flex flex-col items-center relative z-10">
                    <button
                      type="button"
                      onClick={() => goToStep(index)}
                      disabled={index > currentStep}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all border-2",
                        index < currentStep
                          ? "bg-primary text-primary-foreground border-primary cursor-pointer"
                          : index === currentStep
                          ? "bg-primary text-primary-foreground border-primary ring-4 ring-primary/20"
                          : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      )}
                    >
                      {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                    </button>
                    <span
                      className={cn(
                        "text-xs mt-1.5 font-medium hidden sm:block transition-colors",
                        index <= currentStep ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                ))}

                {/* Connecting Lines */}
                {steps.map((_, index) => {
                  if (index === steps.length - 1) return null;
                  return (
                    <div
                      key={`line-${index}`}
                      className={cn(
                        "absolute top-5 h-0.5 transition-colors duration-300",
                        index < currentStep ? "bg-primary" : "bg-border"
                      )}
                      style={{
                        left: `calc(${(index / (steps.length - 1)) * 100}% / ${steps.length} * 2 + 20px)`,
                        right: `calc(${100 - ((index + 1) / (steps.length - 1)) * 100}% / ${steps.length} * 2 + 20px)`,
                      }}
                    />
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>
                    Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
                  </span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full gradient-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            {/* Step Content */}
            <div className="p-6 sm:p-8 min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <CurrentStepComponent />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goPrev}
                disabled={currentStep === 0}
                className="rounded-xl"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={goNext} className="rounded-xl">
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting} variant="accent" className="rounded-xl">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Assessment
                      <Send className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
