import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  Mail,
  MessageSquare,
  Plus,
  Calendar,
  FileText,
  Activity,
  CheckCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  cn,
  formatCurrency,
  getLeadStatusColor,
  getLeadStatusLabel,
  getLeadScoreColor,
} from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const LEADS_PER_PAGE = 20;

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "new", label: "New" },
  { value: "interested", label: "Interested" },
  { value: "in_progress", label: "In Progress" },
  { value: "follow_up", label: "Follow Up" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

const SECTOR_OPTIONS = [
  { value: "all", label: "All Sectors" },
  { value: "IT", label: "IT" },
  { value: "Banking", label: "Banking" },
  { value: "Government", label: "Government" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Education", label: "Education" },
  { value: "Business", label: "Business" },
  { value: "Other", label: "Other" },
];

const SOURCE_OPTIONS = [
  { value: "all", label: "All Sources" },
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "social_media", label: "Social Media" },
  { value: "direct", label: "Direct" },
];

const SORT_OPTIONS = [
  { value: "date_desc", label: "Newest First" },
  { value: "date_asc", label: "Oldest First" },
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "score_desc", label: "Score (High-Low)" },
  { value: "score_asc", label: "Score (Low-High)" },
];

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  sector: string;
  age: number;
  income: number;
  status: string;
  score: number;
  source: string;
  createdAt: string;
  occupation?: string;
  company?: string;
  recommendations?: any[];
  communications?: any[];
  followUps?: any[];
  activities?: any[];
  notes?: string;
  assessment?: any;
}

export default function Leads() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [page, setPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["leads", { statusFilter, sectorFilter, sourceFilter }],
    queryFn: () =>
      api.leads.list({
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(sectorFilter !== "all" && { sector: sectorFilter }),
        ...(sourceFilter !== "all" && { source: sourceFilter }),
      }),
  });

  const { data: leadDetail } = useQuery({
    queryKey: ["lead-detail", selectedLead?.id],
    queryFn: () => api.leads.get(selectedLead!.id),
    enabled: !!selectedLead?.id,
  });

  const { data: communications } = useQuery({
    queryKey: ["communications", selectedLead?.id],
    queryFn: () => api.communications.list(selectedLead!.id),
    enabled: !!selectedLead?.id,
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.leads.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      if (selectedLead) {
        queryClient.invalidateQueries({ queryKey: ["lead-detail", selectedLead.id] });
      }
    },
  });

  const filteredLeads = useMemo(() => {
    let leads: Lead[] = data?.leads || [];

    if (search) {
      const q = search.toLowerCase();
      leads = leads.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.email?.toLowerCase().includes(q)
      );
    }

    const [sortField, sortDir] = sortBy.split("_");
    leads = [...leads].sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "score") cmp = a.score - b.score;
      return sortDir === "desc" ? -cmp : cmp;
    });

    return leads;
  }, [data?.leads, search, sortBy]);

  const totalPages = Math.ceil(filteredLeads.length / LEADS_PER_PAGE);
  const paginatedLeads = filteredLeads.slice(
    (page - 1) * LEADS_PER_PAGE,
    page * LEADS_PER_PAGE
  );

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedLeads.map((l) => l.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkStatusUpdate = () => {
    if (!bulkStatus || selectedIds.size === 0) return;
    selectedIds.forEach((id) => {
      updateLeadMutation.mutate({ id, data: { status: bulkStatus } });
    });
    setSelectedIds(new Set());
    setBulkStatus("");
  };

  const exportCSV = () => {
    const headers = ["Name", "Phone", "Email", "Sector", "Age", "Income", "Status", "Score", "Source", "Date"];
    const rows = filteredLeads.map((l) => [
      l.name,
      l.phone,
      l.email,
      l.sector,
      l.age,
      l.income,
      getLeadStatusLabel(l.status),
      l.score,
      l.source,
      new Date(l.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const closePanel = () => setSelectedLead(null);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6 text-center">
          <p className="text-red-500 font-medium">Failed to load leads</p>
          <p className="text-sm text-gray-500 mt-1">Please try refreshing the page</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all your leads in one place.
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sectorFilter} onValueChange={(v) => { setSectorFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                {SECTOR_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedIds.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-blue-800">
              {selectedIds.size} selected
            </span>
            <Select value={bulkStatus} onValueChange={setBulkStatus}>
              <SelectTrigger className="w-[160px] bg-white">
                <SelectValue placeholder="Update status..." />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.filter((o) => o.value !== "all").map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleBulkStatusUpdate} disabled={!bulkStatus}>
              Apply
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex gap-4 py-3">
                  <div className="h-4 w-4 bg-gray-200 rounded" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="py-3 px-3 text-left">
                      <Checkbox
                        checked={
                          paginatedLeads.length > 0 &&
                          selectedIds.size === paginatedLeads.length
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Name & Phone</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500 hidden md:table-cell">Email</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500 hidden lg:table-cell">Sector</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500 hidden lg:table-cell">Age</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500 hidden xl:table-cell">Income</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Score</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500 hidden md:table-cell">Source</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500 hidden md:table-cell">Date</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeads.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center py-12 text-gray-500">
                        No leads found
                      </td>
                    </tr>
                  ) : (
                    paginatedLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className={cn(
                          "border-b transition-colors cursor-pointer",
                          selectedIds.has(lead.id) ? "bg-blue-50" : "hover:bg-gray-50"
                        )}
                        onClick={() => setSelectedLead(lead)}
                      >
                        <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(lead.id)}
                            onCheckedChange={() => toggleSelect(lead.id)}
                          />
                        </td>
                        <td className="py-3 px-2">
                          <Link
                            to={`/agent-dashboard/leads/${lead.id}`}
                            className="font-medium hover:text-blue-600"
                          >
                            {lead.name}
                          </Link>
                          <p className="text-xs text-gray-500">{lead.phone}</p>
                        </td>
                        <td className="py-3 px-2 text-gray-600 hidden md:table-cell">
                          {lead.email || "-"}
                        </td>
                        <td className="py-3 px-2 text-gray-600 hidden lg:table-cell">
                          {lead.sector}
                        </td>
                        <td className="py-3 px-2 text-gray-600 hidden lg:table-cell">
                          {lead.age}
                        </td>
                        <td className="py-3 px-2 text-gray-600 hidden xl:table-cell">
                          {lead.income ? formatCurrency(lead.income) : "-"}
                        </td>
                        <td className="py-3 px-2">
                          <Badge className={getLeadStatusColor(lead.status)}>
                            {getLeadStatusLabel(lead.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <span className={cn("font-semibold", getLeadScoreColor(lead.score))}>
                            {lead.score}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-600 hidden md:table-cell capitalize">
                          {lead.source?.replace("_", " ")}
                        </td>
                        <td className="py-3 px-2 text-gray-600 hidden md:table-cell">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLead(lead);
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * LEADS_PER_PAGE + 1} to{" "}
                {Math.min(page * LEADS_PER_PAGE, filteredLeads.length)} of{" "}
                {filteredLeads.length} leads
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = page - 2 + i;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={closePanel} />
          <div className="relative w-full max-w-lg bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold">Lead Details</h2>
              <Button variant="ghost" size="icon" onClick={closePanel}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold">{selectedLead.name}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className={getLeadStatusColor(selectedLead.status)}>
                    {getLeadStatusLabel(selectedLead.status)}
                  </Badge>
                  <Badge variant="outline">Score: {selectedLead.score}</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{selectedLead.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{selectedLead.email || "No email"}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Age</p>
                  <p className="font-medium">{selectedLead.age || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Sector</p>
                  <p className="font-medium">{selectedLead.sector || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Occupation</p>
                  <p className="font-medium">{selectedLead.occupation || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Company</p>
                  <p className="font-medium">{selectedLead.company || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Income</p>
                  <p className="font-medium">
                    {selectedLead.income ? formatCurrency(selectedLead.income) : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Source</p>
                  <p className="font-medium capitalize">
                    {selectedLead.source?.replace("_", " ") || "-"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Update Status</p>
                <Select
                  value={selectedLead.status}
                  onValueChange={(v) =>
                    updateLeadMutation.mutate({ id: selectedLead.id, data: { status: v } })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.filter((o) => o.value !== "all").map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {leadDetail?.recommendations && leadDetail.recommendations.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Recommended Policies
                  </p>
                  <div className="space-y-2">
                    {leadDetail.recommendations.slice(0, 3).map((rec: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">
                            {rec.policy?.name || rec.name || "Policy"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {rec.policy?.category || rec.category || ""}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {rec.matchScore || rec.score || 0}% match
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Follow-up
                </Button>
                <Button variant="outline" className="flex-1" size="sm">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  WhatsApp
                </Button>
              </div>

              <div>
                <Link
                  to={`/agent-dashboard/leads/${selectedLead.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View full details →
                </Link>
              </div>

              {communications?.communications && communications.communications.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Communication History
                  </p>
                  <div className="space-y-2">
                    {communications.communications.slice(0, 5).map((comm: any) => (
                      <div key={comm.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="flex justify-between">
                          <Badge variant="outline" className="text-xs">
                            {comm.type || "Message"}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(comm.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-700 line-clamp-2">
                          {comm.message || comm.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedLead.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Notes</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedLead.notes}
                  </p>
                </div>
              )}

              {leadDetail?.activities && leadDetail.activities.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Activity Timeline
                  </p>
                  <div className="space-y-3">
                    {leadDetail.activities.slice(0, 5).map((act: any, idx: number) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          {idx < 4 && <div className="w-px h-full bg-gray-200" />}
                        </div>
                        <div>
                          <p className="text-sm">{act.description || act.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(act.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
