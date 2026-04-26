import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Building,
  Calendar,
  MessageSquare,
  Plus,
  Edit,
  Save,
  X,
  Clock,
  FileText,
  Activity,
  DollarSign,
  Shield,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string>>({});

  const { data: lead, isLoading, error } = useQuery({
    queryKey: ["lead-detail", id],
    queryFn: () => api.leads.get(id!),
    enabled: !!id,
  });

  const { data: communications } = useQuery({
    queryKey: ["communications", id],
    queryFn: () => api.communications.list(id!),
    enabled: !!id,
  });

  const { data: followUps } = useQuery({
    queryKey: ["follow-ups", id],
    queryFn: () => api.followUps.list({ leadId: id! }),
    enabled: !!id,
  });

  const { data: policies } = useQuery({
    queryKey: ["policies"],
    queryFn: () => api.policies.list(),
  });

  const updateLeadMutation = useMutation({
    mutationFn: (data: any) => api.leads.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-detail", id] });
      setEditing(false);
    },
  });

  const createFollowUpMutation = useMutation({
    mutationFn: (data: any) => api.followUps.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-ups", id] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4" />
          <div className="h-48 bg-gray-200 rounded mb-4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6 text-center">
          <p className="text-red-500 font-medium">Lead not found</p>
          <Button variant="link" onClick={() => navigate("/agent-dashboard/leads")}>
            Back to Leads
          </Button>
        </Card>
      </div>
    );
  }

  const startEditing = () => {
    setEditForm({
      name: lead.name || "",
      phone: lead.phone || "",
      email: lead.email || "",
      sector: lead.sector || "",
      age: String(lead.age || ""),
      income: String(lead.income || ""),
      occupation: lead.occupation || "",
      company: lead.company || "",
      notes: lead.notes || "",
    });
    setEditing(true);
  };

  const saveEdit = () => {
    updateLeadMutation.mutate({
      ...editForm,
      age: editForm.age ? parseInt(editForm.age) : undefined,
      income: editForm.income ? parseFloat(editForm.income) : undefined,
    });
  };

  const assessmentData = lead.assessment;
  const recommendations = lead.recommendations || [];
  const comms = communications?.communications || [];
  const fups = followUps?.followUps || [];
  const activities = lead.activities || [];
  const premiumHistory = lead.premiumHistory || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/agent-dashboard/leads")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
          <p className="text-sm text-gray-500">Lead details and management</p>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <Button variant="outline" onClick={startEditing}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={saveEdit} disabled={updateLeadMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Lead Information
              <Badge className={getLeadStatusColor(lead.status)}>
                {getLeadStatusLabel(lead.status)}
              </Badge>
              <Badge className={cn("font-bold", getLeadScoreColor(lead.score))}>
                Score: {lead.score}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Sector</Label>
                  <Input
                    value={editForm.sector}
                    onChange={(e) => setEditForm({ ...editForm, sector: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Income</Label>
                  <Input
                    type="number"
                    value={editForm.income}
                    onChange={(e) => setEditForm({ ...editForm, income: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Occupation</Label>
                  <Input
                    value={editForm.occupation}
                    onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={editForm.company}
                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoItem icon={Phone} label="Phone" value={lead.phone} />
                <InfoItem icon={Mail} label="Email" value={lead.email || "Not provided"} />
                <InfoItem icon={Briefcase} label="Occupation" value={lead.occupation || "-"} />
                <InfoItem icon={Building} label="Company" value={lead.company || "-"} />
                <InfoItem icon={MapPin} label="Sector" value={lead.sector || "-"} />
                <InfoItem icon={Calendar} label="Age" value={lead.age ? `${lead.age} years` : "-"} />
                <InfoItem
                  icon={DollarSign}
                  label="Annual Income"
                  value={lead.income ? formatCurrency(lead.income) : "-"}
                />
                <InfoItem
                  icon={Activity}
                  label="Source"
                  value={lead.source?.replace("_", " ") || "-"}
                />
                <InfoItem
                  icon={Clock}
                  label="Created"
                  value={new Date(lead.createdAt).toLocaleDateString()}
                />
                {lead.notes && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <InfoItem icon={FileText} label="Notes" value={lead.notes} />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-gray-500">Current Status</Label>
              <Select
                value={lead.status}
                onValueChange={(v) => updateLeadMutation.mutate({ status: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["new", "interested", "in_progress", "follow_up", "converted", "lost"].map(
                    (s) => (
                      <SelectItem key={s} value={s}>
                        {getLeadStatusLabel(s)}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Lead Score</Label>
              <div className="flex items-center gap-3 mt-2">
                <Progress value={lead.score} className="flex-1" />
                <span className={cn("text-2xl font-bold", getLeadScoreColor(lead.score))}>
                  {lead.score}
                </span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Follow-up
              </Button>
              <Button variant="outline" className="flex-1" size="sm">
                <MessageSquare className="h-4 w-4 mr-1" />
                WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assessment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="policies">Policies ({recommendations.length})</TabsTrigger>
          <TabsTrigger value="communications">Communications ({comms.length})</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups ({fups.length})</TabsTrigger>
          <TabsTrigger value="premiums">Premiums</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Data</CardTitle>
            </CardHeader>
            <CardContent>
              {assessmentData ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(assessmentData).map(([key, value]) => {
                      if (typeof value === "object" || key === "id") return null;
                      return (
                        <div key={key} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </p>
                          <p className="font-medium mt-1">
                            {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  {assessmentData.dependents !== undefined && (
                    <div>
                      <p className="text-sm font-medium mb-2">Family Details</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {assessmentData.dependents}
                          </p>
                          <p className="text-xs text-gray-500">Dependents</p>
                        </div>
                        {assessmentData.maritalStatus && (
                          <div className="p-3 bg-green-50 rounded-lg text-center">
                            <p className="text-lg font-bold text-green-600">
                              {assessmentData.maritalStatus}
                            </p>
                            <p className="text-xs text-gray-500">Marital Status</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No assessment data available for this lead
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Policies</CardTitle>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No policy recommendations yet
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">
                            {rec.policy?.name || rec.name || "Policy"}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {rec.policy?.category || rec.category || ""}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {rec.matchScore || rec.score || 0}% match
                        </Badge>
                      </div>
                      {(rec.policy?.description || rec.description) && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {rec.policy?.description || rec.description}
                        </p>
                      )}
                      {(rec.policy?.premiumAmount || rec.premiumAmount) && (
                        <p className="text-sm font-medium mt-2">
                          Premium: {formatCurrency(rec.policy?.premiumAmount || rec.premiumAmount)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications">
          <Card>
            <CardHeader>
              <CardTitle>Communication Log</CardTitle>
            </CardHeader>
            <CardContent>
              {comms.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No communications recorded
                </p>
              ) : (
                <div className="space-y-4">
                  {comms.map((comm: any) => (
                    <div key={comm.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{comm.type || "Message"}</Badge>
                          {comm.direction && (
                            <Badge
                              className={
                                comm.direction === "outgoing"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {comm.direction}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(comm.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comm.message || comm.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="followups">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Follow-ups</CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Follow-up
              </Button>
            </CardHeader>
            <CardContent>
              {fups.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No follow-ups scheduled</p>
              ) : (
                <div className="space-y-3">
                  {fups.map((fu: any) => (
                    <div
                      key={fu.id}
                      className={cn(
                        "border rounded-lg p-4",
                        fu.status === "completed" && "bg-green-50 border-green-200",
                        fu.status === "pending" && "bg-orange-50 border-orange-200"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{fu.type || "Follow-up"}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(fu.scheduledAt).toLocaleString()}
                          </p>
                          {fu.notes && (
                            <p className="text-sm text-gray-600 mt-2">{fu.notes}</p>
                          )}
                        </div>
                        <Badge
                          className={
                            fu.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : fu.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-orange-100 text-orange-800"
                          }
                        >
                          {fu.status || "Pending"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="premiums">
          <Card>
            <CardHeader>
              <CardTitle>Premium Calculations</CardTitle>
            </CardHeader>
            <CardContent>
              {premiumHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No premium calculations available
                </p>
              ) : (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={premiumHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="policyName" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip formatter={(val: any) => formatCurrency(val)} />
                      <Bar dataKey="premium" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Policy</th>
                          <th className="text-left py-2">Sum Assured</th>
                          <th className="text-left py-2">Term</th>
                          <th className="text-left py-2">Premium</th>
                          <th className="text-left py-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {premiumHistory.map((p: any, idx: number) => (
                          <tr key={idx} className="border-b">
                            <td className="py-2">{p.policyName}</td>
                            <td className="py-2">{formatCurrency(p.sumAssured)}</td>
                            <td className="py-2">{p.term} years</td>
                            <td className="py-2 font-medium">{formatCurrency(p.premium)}</td>
                            <td className="py-2 text-gray-500">
                              {new Date(p.calculatedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No activity recorded</p>
              ) : (
                <div className="space-y-0">
                  {activities.map((act: any, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mt-1" />
                        {idx < activities.length - 1 && (
                          <div className="w-px flex-1 bg-gray-200" />
                        )}
                      </div>
                      <div className="pb-6">
                        <p className="font-medium text-sm">
                          {act.description || act.title || act.type}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(act.createdAt).toLocaleString()}
                        </p>
                        {act.details && (
                          <p className="text-sm text-gray-600 mt-1">{act.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-gray-400 mt-0.5" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
