import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const insuranceTypes = [
  "Term",
  "Endowment",
  "ULIP",
  "Group",
  "None",
] as const;

const investmentGoals = [
  "Retirement Planning",
  "Children Education",
  "Children Marriage",
  "Tax Saving",
  "Wealth Creation",
  "Family Protection",
] as const;

const riskAppetites = ["Conservative", "Moderate", "Aggressive"] as const;

export default function StepFinancial() {
  const {
    register,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useFormContext();

  const hasExistingInsurance = watch("existingLifeInsurance") || false;

  const e = errors as Record<string, { message?: string }>;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="monthlyIncome">
            Monthly Income (₹) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="monthlyIncome"
            type="number"
            min={0}
            placeholder="Enter monthly income"
            {...register("monthlyIncome", { valueAsNumber: true })}
            className={cn(e.monthlyIncome && "border-red-500 focus-visible:ring-red-500")}
          />
          {e.monthlyIncome && (
            <p className="text-xs text-red-500 mt-0.5">{e.monthlyIncome.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="monthlyExpenses">
            Monthly Expenses (₹) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="monthlyExpenses"
            type="number"
            min={0}
            placeholder="Enter monthly expenses"
            {...register("monthlyExpenses", { valueAsNumber: true })}
            className={cn(e.monthlyExpenses && "border-red-500 focus-visible:ring-red-500")}
          />
          {e.monthlyExpenses && (
            <p className="text-xs text-red-500 mt-0.5">{e.monthlyExpenses.message}</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border p-4 bg-muted/30 space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="existingLifeInsurance"
            checked={hasExistingInsurance}
            onCheckedChange={(checked) => setValue("existingLifeInsurance", !!checked)}
          />
          <Label htmlFor="existingLifeInsurance" className="font-medium cursor-pointer">
            Do you have existing life insurance?
          </Label>
        </div>

        {hasExistingInsurance && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="insuranceType">
                Insurance Type <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(v) => setValue("insuranceType", v)}>
                <SelectTrigger className={cn(e.insuranceType && "border-red-500 focus-visible:ring-red-500")}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {insuranceTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {e.insuranceType && (
                <p className="text-xs text-red-500 mt-0.5">{e.insuranceType.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="insuranceProvider">Insurance Provider</Label>
              <Input
                id="insuranceProvider"
                placeholder="e.g., LIC, HDFC Life"
                {...register("insuranceProvider")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sumAssured">Sum Assured (₹)</Label>
              <Input
                id="sumAssured"
                type="number"
                min={0}
                placeholder="Enter sum assured"
                {...register("sumAssured", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="annualPremium">Annual Premium (₹)</Label>
              <Input
                id="annualPremium"
                type="number"
                min={0}
                placeholder="Enter annual premium"
                {...register("annualPremium", { valueAsNumber: true })}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label>
          Investment Goals <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {investmentGoals.map((goal) => (
            <label
              key={goal}
              className={cn(
                "flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted/50",
                "has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              )}
            >
              <input
                type="checkbox"
                value={goal}
                {...register("investmentGoals")}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <span className="text-sm">{goal}</span>
            </label>
          ))}
        </div>
        {e.investmentGoals && (
          <p className="text-xs text-red-500 mt-0.5">{e.investmentGoals.message}</p>
        )}
      </div>

      <div className="space-y-1.5 max-w-xs">
        <Label htmlFor="riskAppetite">
          Risk Appetite <span className="text-red-500">*</span>
        </Label>
        <Select onValueChange={(v) => setValue("riskAppetite", v)}>
          <SelectTrigger className={cn(e.riskAppetite && "border-red-500 focus-visible:ring-red-500")}>
            <SelectValue placeholder="Select risk appetite" />
          </SelectTrigger>
            <SelectContent>
              {riskAppetites.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
        </Select>
        {e.riskAppetite && (
          <p className="text-xs text-red-500 mt-0.5">{e.riskAppetite.message}</p>
        )}
      </div>
    </div>
  );
}
