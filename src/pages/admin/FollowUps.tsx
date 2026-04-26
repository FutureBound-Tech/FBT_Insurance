import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  MessageSquare,
  Video,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FOLLOW_UP_TYPES = [
  { value: "call", label: "Phone Call", icon: Phone },
  { value: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { value: "meeting", label: "Meeting", icon: MapPin },
  { value: "video_call", label: "Video Call", icon: Video },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

interface FollowUp {
  id: string;
  leadId: string;
  lead?: {
    id: string;
    name: string;
    phone: string;
  };
  type: string;
  status: string;
  scheduledAt: string;
  completedAt?: string;
  notes?: string;
}

export default function FollowUps() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [rescheduleItem, setRescheduleItem] = useState<FollowUp | null>(null);
  const [newFollowUp, setNewFollowUp] = useState({
    leadId: "",
    type: "call",
    scheduledAt: "",
    notes: "",
  });

  const dateStr = selectedDate.toISOString().split("T")[0];

  const { data, isLoading, error } = useQuery({
    queryKey: ["follow-ups", { statusFilter, dateStr }],
    queryFn: () =>
      api.followUps.list({
        ...(statusFilter !== "all" && { status: statusFilter }),
        date: dateStr,
      }),
  });

  const { data: leadsData } = useQuery({
    queryKey: ["leads-list"],
    queryFn: () => api.leads.list(),
  });

  const updateFollowUpMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.followUps.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
    },
  });

  const createFollowUpMutation = useMutation({
    mutationFn: (data: any) => api.followUps.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
      setShowAddModal(false);
      setNewFollowUp({ leadId: "", type: "call", scheduledAt: "", notes: "" });
    },
  });

  const followUps: FollowUp[] = data?.followUps || [];
  const leads = leadsData?.leads || [];

  const todayFollowUps = followUps.filter((fu) => {
    const fuDate = new Date(fu.scheduledAt).toDateString();
    const today = new Date().toDateString();
    return fuDate === today;
  });

  const upcomingFollowUps = followUps.filter((fu) => {
    const fuDate = new Date(fu.scheduledAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return fuDate > today;
  });

  const getTypeIcon = (type: string) => {
    const found = FOLLOW_UP_TYPES.find((t) => t.value === type);
    return found?.icon || Phone;
  };

  const markComplete = (fu: FollowUp) => {
    updateFollowUpMutation.mutate({
      id: fu.id,
      data: { status: "completed", completedAt: new Date().toISOString() },
    });
  };

  const cancelFollowUp = (fu: FollowUp) => {
    updateFollowUpMutation.mutate({
      id: fu.id,
      data: { status: "cancelled" },
    });
  };

  const handleReschedule = () => {
    if (!rescheduleItem || !newFollowUp.scheduledAt) return;
    updateFollowUpMutation.mutate({
      id: rescheduleItem.id,
      data: { scheduledAt: newFollowUp.scheduledAt },
    });
    setRescheduleItem(null);
    setNewFollowUp({ ...newFollowUp, scheduledAt: "" });
  };

  const handleCreate = () => {
    if (!newFollowUp.leadId || !newFollowUp.scheduledAt) return;
    createFollowUpMutation.mutate(newFollowUp);
  };

  const navigateDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6 text-center">
          <p className="text-red-500 font-medium">Failed to load follow-ups</p>
          <p className="text-sm text-gray-500 mt-1">Please try refreshing</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Follow-ups</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your follow-up schedule
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Follow-up
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateDate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 px-3 py-1.5 border rounded-md">
                <Calendar className="h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="text-sm bg-transparent outline-none"
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => navigateDate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </Button>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">
            Today ({todayFollowUps.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({followUps.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <FollowUpList
            items={todayFollowUps}
            isLoading={isLoading}
            getTypeIcon={getTypeIcon}
            markComplete={markComplete}
            cancelFollowUp={cancelFollowUp}
            setRescheduleItem={setRescheduleItem}
            emptyMessage="No follow-ups scheduled for today"
          />
        </TabsContent>

        <TabsContent value="all">
          <FollowUpList
            items={followUps}
            isLoading={isLoading}
            getTypeIcon={getTypeIcon}
            markComplete={markComplete}
            cancelFollowUp={cancelFollowUp}
            setRescheduleItem={setRescheduleItem}
            emptyMessage="No follow-ups found"
          />
        </TabsContent>
      </Tabs>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Follow-up</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Lead</Label>
              <Select
                value={newFollowUp.leadId}
                onValueChange={(v) =>
                  setNewFollowUp({ ...newFollowUp, leadId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((lead: any) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name} - {lead.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={newFollowUp.type}
                onValueChange={(v) =>
                  setNewFollowUp({ ...newFollowUp, type: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOLLOW_UP_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Scheduled Date & Time</Label>
              <Input
                type="datetime-local"
                value={newFollowUp.scheduledAt}
                onChange={(e) =>
                  setNewFollowUp({ ...newFollowUp, scheduledAt: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={newFollowUp.notes}
                onChange={(e) =>
                  setNewFollowUp({ ...newFollowUp, notes: e.target.value })
                }
                placeholder="Optional notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                !newFollowUp.leadId ||
                !newFollowUp.scheduledAt ||
                createFollowUpMutation.isPending
              }
            >
              Create Follow-up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!rescheduleItem}
        onOpenChange={(open) => !open && setRescheduleItem(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Follow-up</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {rescheduleItem && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm">
                  {rescheduleItem.lead?.name || "Lead"}
                </p>
                <p className="text-xs text-gray-500">
                  Current: {new Date(rescheduleItem.scheduledAt).toLocaleString()}
                </p>
              </div>
            )}
            <div>
              <Label>New Date & Time</Label>
              <Input
                type="datetime-local"
                value={newFollowUp.scheduledAt}
                onChange={(e) =>
                  setNewFollowUp({ ...newFollowUp, scheduledAt: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleItem(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={!newFollowUp.scheduledAt || updateFollowUpMutation.isPending}
            >
              Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FollowUpList({
  items,
  isLoading,
  getTypeIcon,
  markComplete,
  cancelFollowUp,
  setRescheduleItem,
  emptyMessage,
}: {
  items: FollowUp[];
  isLoading: boolean;
  getTypeIcon: (type: string) => any;
  markComplete: (fu: FollowUp) => void;
  cancelFollowUp: (fu: FollowUp) => void;
  setRescheduleItem: (fu: FollowUp) => void;
  emptyMessage: string;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 flex gap-4">
              <div className="h-10 w-10 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((fu) => {
        const Icon = getTypeIcon(fu.type);
        return (
          <Card
            key={fu.id}
            className={cn(
              "transition-shadow hover:shadow-md",
              fu.status === "completed" && "bg-green-50 border-green-200",
              fu.status === "cancelled" && "bg-red-50 border-red-200 opacity-60"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    fu.status === "completed"
                      ? "bg-green-100"
                      : fu.status === "cancelled"
                      ? "bg-red-100"
                      : "bg-blue-100"
                  )}
                >
                  {fu.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : fu.status === "cancelled" ? (
                    <XCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <Icon className="h-5 w-5 text-blue-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={`/agent-dashboard/leads/${fu.leadId}`}
                      className="font-medium hover:text-blue-600"
                    >
                      {fu.lead?.name || "Unknown Lead"}
                    </Link>
                    <Badge
                      className={cn(
                        "text-xs",
                        fu.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : fu.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-orange-100 text-orange-800"
                      )}
                    >
                      {fu.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(fu.scheduledAt).toLocaleString()}
                    </span>
                    {fu.lead?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {fu.lead.phone}
                      </span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {FOLLOW_UP_TYPES.find((t) => t.value === fu.type)?.label || fu.type}
                    </Badge>
                  </div>

                  {fu.notes && (
                    <p className="text-sm text-gray-600 mt-2">{fu.notes}</p>
                  )}
                </div>

                {fu.status === "pending" && (
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => markComplete(fu)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setRescheduleItem(fu);
                      }}
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => cancelFollowUp(fu)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
