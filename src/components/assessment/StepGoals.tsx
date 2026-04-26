import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { cn, formatCurrency } from "@/lib/utils";

const priorities = ["Highest Coverage", "Best Returns", "Balanced", "Low Premium"] as const;

const contactTimes = ["Morning", "Afternoon", "Evening", "Anytime"] as const;

export default function StepGoals() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const preferredSumAssured = watch("preferredSumAssured") || 200000;
  const preferredTerm = watch("preferredTerm") || 20;

  const e = errors as Record<string, { message?: string }>;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="preferredSumAssured">
            Preferred Sum Assured <span className="text-red-500">*</span>
          </Label>
          <span className="text-sm font-semibold text-primary">
            {formatCurrency(preferredSumAssured)}
          </span>
        </div>
        <Slider
          value={preferredSumAssured}
          onChange={(v) => setValue("preferredSumAssured", v)}
          min={200000}
          max={50000000}
          step={100000}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>₹2L</span>
          <span>₹5Cr</span>
        </div>
        {e.preferredSumAssured && (
          <p className="text-xs text-red-500">{e.preferredSumAssured.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="preferredTerm">
            Preferred Term <span className="text-red-500">*</span>
          </Label>
          <span className="text-sm font-semibold text-primary">
            {preferredTerm} years
          </span>
        </div>
        <Slider
          value={preferredTerm}
          onChange={(v) => setValue("preferredTerm", v)}
          min={5}
          max={40}
          step={1}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>5 years</span>
          <span>40 years</span>
        </div>
        {e.preferredTerm && (
          <p className="text-xs text-red-500">{e.preferredTerm.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="monthlyBudget">
            Monthly Budget for Insurance (₹) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="monthlyBudget"
            type="number"
            min={500}
            placeholder="Enter amount"
            {...register("monthlyBudget", { valueAsNumber: true })}
            className={cn(e.monthlyBudget && "border-red-500 focus-visible:ring-red-500")}
          />
          {e.monthlyBudget && (
            <p className="text-xs text-red-500 mt-0.5">{e.monthlyBudget.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="priority">
            Priority <span className="text-red-500">*</span>
          </Label>
          <Select onValueChange={(v) => setValue("priority", v)}>
            <SelectTrigger className={cn(e.priority && "border-red-500 focus-visible:ring-red-500")}>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {e.priority && (
            <p className="text-xs text-red-500 mt-0.5">{e.priority.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="preferredContactTime">Preferred Contact Time</Label>
          <Select onValueChange={(v) => setValue("preferredContactTime", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {contactTimes.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border p-4 bg-muted/30 space-y-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="whatsappOptin"
            checked={watch("whatsappOptin")}
            onCheckedChange={(checked) => setValue("whatsappOptin", !!checked)}
            className="mt-0.5"
          />
          <div>
            <Label htmlFor="whatsappOptin" className="font-medium cursor-pointer">
              WhatsApp Communication Opt-in
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Receive policy updates, premium reminders, and personalized
              recommendations via WhatsApp.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="additionalNotes">Additional Notes</Label>
        <textarea
          id="additionalNotes"
          rows={3}
          placeholder="Any specific requirements or questions..."
          {...register("additionalNotes")}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </div>
    </div>
  );
}
