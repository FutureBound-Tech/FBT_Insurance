import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const maritalStatuses = ["Single", "Married", "Divorced", "Widowed"] as const;

export default function StepFamily() {
  const {
    register,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useFormContext();

  const numberOfChildren = useWatch({ control, name: "numberOfChildren" }) || 0;
  const spouseWorking = useWatch({ control, name: "spouseWorking" }) || false;
  const maritalStatus = useWatch({ control, name: "maritalStatus" }) || "";

  const e = errors as Record<string, { message?: string }>;
  const childAgeErrors = e.childrenAges as unknown as Record<number, { message?: string }> | undefined;

  const showSpouseFields = maritalStatus === "Married" || maritalStatus === "Divorced";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="maritalStatus">
            Marital Status <span className="text-red-500">*</span>
          </Label>
          <Select onValueChange={(v) => setValue("maritalStatus", v)}>
            <SelectTrigger className={cn(e.maritalStatus && "border-red-500 focus-visible:ring-red-500")}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {maritalStatuses.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {e.maritalStatus && (
            <p className="text-xs text-red-500 mt-0.5">{e.maritalStatus.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="numberOfChildren">Number of Children</Label>
          <Input
            id="numberOfChildren"
            type="number"
            min={0}
            max={10}
            defaultValue={0}
            {...register("numberOfChildren", { valueAsNumber: true })}
            className={cn(e.numberOfChildren && "border-red-500 focus-visible:ring-red-500")}
          />
          {e.numberOfChildren && (
            <p className="text-xs text-red-500 mt-0.5">{e.numberOfChildren.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dependentParents">Dependent Parents (0-4)</Label>
          <Input
            id="dependentParents"
            type="number"
            min={0}
            max={4}
            defaultValue={0}
            {...register("dependentParents", { valueAsNumber: true })}
            className={cn(e.dependentParents && "border-red-500 focus-visible:ring-red-500")}
          />
          {e.dependentParents && (
            <p className="text-xs text-red-500 mt-0.5">{e.dependentParents.message}</p>
          )}
        </div>
      </div>

      {numberOfChildren > 0 && (
        <div className="space-y-3">
          <Label>Children Ages</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: Math.min(numberOfChildren, 10) }, (_, i) => (
              <div key={i} className="space-y-1">
                <Label htmlFor={`childAge${i}`} className="text-xs text-muted-foreground">
                  Child {i + 1}
                </Label>
                <Input
                  id={`childAge${i}`}
                  type="number"
                  min={0}
                  max={40}
                  placeholder="Age"
                  {...register(`childrenAges.${i}`, { valueAsNumber: true })}
                  className={cn(
                    "h-8 text-sm",
                    childAgeErrors?.[i] && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {showSpouseFields && (
        <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
          <div className="flex items-center gap-2">
            <Checkbox
              id="spouseWorking"
              checked={watch("spouseWorking")}
              onCheckedChange={(checked) => setValue("spouseWorking", !!checked)}
            />
            <Label htmlFor="spouseWorking" className="font-normal cursor-pointer">
              Spouse is currently working
            </Label>
          </div>

          {spouseWorking && (
            <div className="space-y-1.5 max-w-xs">
              <Label htmlFor="spouseIncome">Monthly Spouse Income (₹)</Label>
              <Input
                id="spouseIncome"
                type="number"
                min={0}
                placeholder="Enter amount"
                {...register("spouseIncome", { valueAsNumber: true })}
                className={cn(e.spouseIncome && "border-red-500 focus-visible:ring-red-500")}
              />
              {e.spouseIncome && (
                <p className="text-xs text-red-500 mt-0.5">{e.spouseIncome.message}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
