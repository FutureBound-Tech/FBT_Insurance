import { useFormContext, useWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const healthStatuses = ["Excellent", "Good", "Average", "Below Average"] as const;

const familyHistoryOptions = ["Diabetes", "Heart Disease", "Cancer", "None"] as const;

export default function StepHealth() {
  const {
    register,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useFormContext();

  const hasChronicDisease = watch("chronicDisease") || false;

  const e = errors as Record<string, { message?: string }>;

  return (
    <div className="space-y-5">
      <div className="space-y-1.5 max-w-xs">
        <Label htmlFor="healthStatus">
          Health Status <span className="text-red-500">*</span>
        </Label>
        <Select onValueChange={(v) => setValue("healthStatus", v)}>
          <SelectTrigger className={cn(e.healthStatus && "border-red-500 focus-visible:ring-red-500")}>
            <SelectValue placeholder="Select health status" />
          </SelectTrigger>
            <SelectContent>
              {healthStatuses.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
        </Select>
        {e.healthStatus && (
          <p className="text-xs text-red-500 mt-0.5">{e.healthStatus.message}</p>
        )}
      </div>

      <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
        <Label className="font-medium">Lifestyle Habits</Label>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="smoking"
              checked={watch("smoking")}
              onCheckedChange={(checked) => setValue("smoking", !!checked)}
            />
            <Label htmlFor="smoking" className="font-normal cursor-pointer">
              Do you smoke?
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="drinking"
              checked={watch("drinking")}
              onCheckedChange={(checked) => setValue("drinking", !!checked)}
            />
            <Label htmlFor="drinking" className="font-normal cursor-pointer">
              Do you consume alcohol?
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
        <div className="flex items-center gap-2">
          <Checkbox
            id="chronicDisease"
            checked={hasChronicDisease}
            onCheckedChange={(checked) => setValue("chronicDisease", !!checked)}
          />
          <Label htmlFor="chronicDisease" className="font-medium cursor-pointer">
            Do you have any chronic disease?
          </Label>
        </div>

        {hasChronicDisease && (
          <div className="space-y-1.5">
            <Label htmlFor="chronicDiseaseDetails">
              Please specify <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="chronicDiseaseDetails"
              rows={3}
              placeholder="Describe your condition..."
              {...register("chronicDiseaseDetails")}
              className={cn(
                "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none",
                e.chronicDiseaseDetails && "border-red-500 focus-visible:ring-red-500"
              )}
            />
            {e.chronicDiseaseDetails && (
              <p className="text-xs text-red-500 mt-0.5">{e.chronicDiseaseDetails.message}</p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label>
          Family Medical History <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {familyHistoryOptions.map((option) => (
            <label
              key={option}
              className={cn(
                "flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted/50",
                "has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              )}
            >
              <input
                type="checkbox"
                value={option}
                {...register("familyMedicalHistory")}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
        {e.familyMedicalHistory && (
          <p className="text-xs text-red-500 mt-0.5">{e.familyMedicalHistory.message}</p>
        )}
      </div>
    </div>
  );
}
