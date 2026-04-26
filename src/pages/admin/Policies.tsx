import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Shield,
  CheckCircle,
  XCircle,
  DollarSign,
  Clock,
  Users,
  FileText,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const CATEGORIES = [
  "All",
  "Term Life",
  "Endowment",
  "ULIP",
  "Money Back",
  "Pension",
  "Child Plan",
  "Health",
  "Micro Insurance",
];

interface Policy {
  id: string;
  name: string;
  category: string;
  description: string;
  minAge: number;
  maxAge: number;
  minSumAssured: number;
  maxSumAssured: number;
  minTerm: number;
  maxTerm: number;
  premiumFrequency: string;
  isActive: boolean;
  features: string[];
  benefits: string[];
  taxBenefits: boolean;
}

export default function Policies() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["policies"],
    queryFn: () => api.policies.list(),
  });

  const policies: Policy[] = data?.policies || [];

  const filteredPolicies = policies.filter((p) => {
    const matchesSearch =
      !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6 text-center">
          <p className="text-red-500 font-medium">Failed to load policies</p>
          <p className="text-sm text-gray-500 mt-1">Please try refreshing</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Policies</h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse and manage LIC policy catalog
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search policies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-5 w-40 bg-gray-200 rounded mb-3" />
                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-full bg-gray-200 rounded mb-1" />
                <div className="h-3 w-3/4 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPolicies.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No policies found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your search or filter
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPolicies.map((policy) => (
            <Card
              key={policy.id}
              className={cn(
                "cursor-pointer hover:shadow-lg transition-shadow",
                !policy.isActive && "opacity-60"
              )}
              onClick={() => setSelectedPolicy(policy)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{policy.name}</h3>
                      <Badge variant="outline" className="text-xs mt-0.5">
                        {policy.category}
                      </Badge>
                    </div>
                  </div>
                  {policy.isActive ? (
                    <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-600 text-xs">Inactive</Badge>
                  )}
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {policy.description}
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Users className="h-3.5 w-3.5" />
                    <span>
                      Age {policy.minAge}-{policy.maxAge}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {policy.minTerm}-{policy.maxTerm} yrs
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>
                      {formatCurrency(policy.minSumAssured)}+
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <FileText className="h-3.5 w-3.5" />
                    <span>{policy.premiumFrequency}</span>
                  </div>
                </div>

                {policy.taxBenefits && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Tax Benefits u/s 80C & 10(10D)</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={!!selectedPolicy}
        onOpenChange={(open) => !open && setSelectedPolicy(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedPolicy && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedPolicy.name}</DialogTitle>
                    <DialogDescription>
                      <Badge variant="outline" className="mt-1">
                        {selectedPolicy.category}
                      </Badge>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-2">Description</h4>
                  <p className="text-sm">{selectedPolicy.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-lg font-bold text-blue-600">
                      {selectedPolicy.minAge}-{selectedPolicy.maxAge}
                    </p>
                    <p className="text-xs text-gray-500">Age Range</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-lg font-bold text-blue-600">
                      {selectedPolicy.minTerm}-{selectedPolicy.maxTerm}
                    </p>
                    <p className="text-xs text-gray-500">Term (Years)</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-lg font-bold text-blue-600 text-sm">
                      {formatCurrency(selectedPolicy.minSumAssured)}
                    </p>
                    <p className="text-xs text-gray-500">Min Sum Assured</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-lg font-bold text-blue-600">
                      {selectedPolicy.premiumFrequency}
                    </p>
                    <p className="text-xs text-gray-500">Premium Freq</p>
                  </div>
                </div>

                {selectedPolicy.features && selectedPolicy.features.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 mb-2">Features</h4>
                    <ul className="space-y-2">
                      {selectedPolicy.features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedPolicy.benefits && selectedPolicy.benefits.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 mb-2">Benefits</h4>
                    <ul className="space-y-2">
                      {selectedPolicy.benefits.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Shield className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedPolicy.taxBenefits && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="font-medium text-green-800">Tax Benefits Available</p>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Eligible for deduction under Section 80C and maturity exempt under
                      Section 10(10D) of Income Tax Act.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
