import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const occupations = [
  "Software Engineer",
  "Manager",
  "Business Owner",
  "Banker",
  "Government Officer",
  "Doctor",
  "Lawyer",
  "Teacher",
  "Accountant",
  "Others",
] as const;

const sectors = [
  "IT",
  "Banking",
  "Government",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retired",
  "Others",
] as const;

const genders = ["Male", "Female", "Other"] as const;

export default function StepPersonal() {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  const e = errors as Record<string, { message?: string }>;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            placeholder="Enter full name"
            {...register("fullName")}
            className={cn(e.fullName && "border-red-500 focus-visible:ring-red-500")}
          />
          {e.fullName && (
            <p className="text-xs text-red-500 mt-0.5">{e.fullName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">
              +91
            </span>
            <Input
              id="phone"
              placeholder="10-digit number"
              maxLength={10}
              {...register("phone")}
              className={cn("rounded-l-none", e.phone && "border-red-500 focus-visible:ring-red-500")}
            />
          </div>
          {e.phone && (
            <p className="text-xs text-red-500 mt-0.5">{e.phone.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="Optional"
            {...register("email")}
            className={cn(e.email && "border-red-500 focus-visible:ring-red-500")}
          />
          {e.email && (
            <p className="text-xs text-red-500 mt-0.5">{e.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="age">
            Age <span className="text-red-500">*</span>
          </Label>
          <Input
            id="age"
            type="number"
            min={18}
            max={80}
            placeholder="18-80"
            {...register("age", { valueAsNumber: true })}
            className={cn(e.age && "border-red-500 focus-visible:ring-red-500")}
          />
          {e.age && (
            <p className="text-xs text-red-500 mt-0.5">{e.age.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="gender">
            Gender <span className="text-red-500">*</span>
          </Label>
          <Select onValueChange={(v) => setValue("gender", v)}>
            <SelectTrigger className={cn(e.gender && "border-red-500 focus-visible:ring-red-500")}>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {genders.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {e.gender && (
            <p className="text-xs text-red-500 mt-0.5">{e.gender.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="occupation">
            Occupation <span className="text-red-500">*</span>
          </Label>
          <Select onValueChange={(v) => setValue("occupation", v)}>
            <SelectTrigger className={cn(e.occupation && "border-red-500 focus-visible:ring-red-500")}>
              <SelectValue placeholder="Select occupation" />
            </SelectTrigger>
            <SelectContent>
              {occupations.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {e.occupation && (
            <p className="text-xs text-red-500 mt-0.5">{e.occupation.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="companyName">Company Name (Optional)</Label>
          <Input
            id="companyName"
            placeholder="Optional"
            {...register("companyName")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sector">
            Sector <span className="text-red-500">*</span>
          </Label>
          <Select onValueChange={(v) => setValue("sector", v)}>
            <SelectTrigger className={cn(e.sector && "border-red-500 focus-visible:ring-red-500")}>
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {e.sector && (
            <p className="text-xs text-red-500 mt-0.5">{e.sector.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
