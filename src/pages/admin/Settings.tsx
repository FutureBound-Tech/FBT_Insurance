import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  Bell,
  Save,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const DEFAULT_TEMPLATES = [
  {
    id: "1",
    name: "Welcome Message",
    content:
      "Hello {name}, thank you for your interest in LIC policies. I'm your dedicated advisor. How can I help you today?",
    category: "onboarding",
  },
  {
    id: "2",
    name: "Follow-up Reminder",
    content:
      "Hi {name}, this is a gentle reminder about our scheduled call today at {time}. Looking forward to speaking with you!",
    category: "follow_up",
  },
  {
    id: "3",
    name: "Policy Recommendation",
    content:
      "Dear {name}, based on your requirements, I recommend {policy_name}. It offers {benefits}. Shall we discuss this further?",
    category: "sales",
  },
  {
    id: "4",
    name: "Premium Due",
    content:
      "Hello {name}, your premium of {amount} for {policy_name} is due on {date}. Please ensure timely payment to keep your coverage active.",
    category: "reminder",
  },
  {
    id: "5",
    name: "Birthday Wishes",
    content:
      "Happy Birthday {name}! Wishing you health, wealth, and happiness. Remember, a good insurance plan is the best gift for your family.",
    category: "greeting",
  },
];

export default function Settings() {
  const queryClient = useQueryClient();
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [editingTemplate, setEditingTemplate] = useState<(typeof DEFAULT_TEMPLATES)[0] | null>(
    null
  );
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [notifications, setNotifications] = useState({
    newLeadAlert: true,
    followUpReminder: true,
    conversionAlert: true,
    dailySummary: false,
    whatsappNotification: true,
  });

  const { data: userData } = useQuery({
    queryKey: ["auth-me"],
    queryFn: () => api.auth.me(),
  });

  const saveTemplate = () => {
    if (!editingTemplate) return;
    setTemplates((prev) =>
      prev.map((t) => (t.id === editingTemplate.id ? editingTemplate : t))
    );
    setShowTemplateModal(false);
    setEditingTemplate(null);
  };

  const addTemplate = () => {
    const newTemplate = {
      id: String(Date.now()),
      name: "New Template",
      content: "",
      category: "custom",
    };
    setTemplates([...templates, newTemplate]);
    setEditingTemplate(newTemplate);
    setShowTemplateModal(true);
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your profile and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="templates">WhatsApp Templates</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Agent Profile</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-[#1e3a5f] flex items-center justify-center text-2xl font-bold text-white">
                  {(userData?.name || "A")
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {userData?.name || "Agent Name"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {userData?.role || "LIC Advisor"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">
                    <User className="h-4 w-4 inline mr-1" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profile.name || userData?.name || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email || userData?.email || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={profile.phone || userData?.phone || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>WhatsApp Message Templates</CardTitle>
                <CardDescription>
                  Manage your message templates for quick responses
                </CardDescription>
              </div>
              <Button onClick={addTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {template.category.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {template.content}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingTemplate(template);
                            setShowTemplateModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {templates.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No templates yet</p>
                    <Button className="mt-4" onClick={addTemplate}>
                      Create your first template
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <NotificationToggle
                label="New Lead Alerts"
                description="Get notified when a new lead is added"
                checked={notifications.newLeadAlert}
                onChange={(v) =>
                  setNotifications({ ...notifications, newLeadAlert: v })
                }
              />
              <NotificationToggle
                label="Follow-up Reminders"
                description="Receive reminders before scheduled follow-ups"
                checked={notifications.followUpReminder}
                onChange={(v) =>
                  setNotifications({ ...notifications, followUpReminder: v })
                }
              />
              <NotificationToggle
                label="Conversion Alerts"
                description="Get notified when a lead is converted"
                checked={notifications.conversionAlert}
                onChange={(v) =>
                  setNotifications({ ...notifications, conversionAlert: v })
                }
              />
              <NotificationToggle
                label="Daily Summary"
                description="Receive a daily summary of your activities"
                checked={notifications.dailySummary}
                onChange={(v) =>
                  setNotifications({ ...notifications, dailySummary: v })
                }
              />
              <NotificationToggle
                label="WhatsApp Notifications"
                description="Receive notifications via WhatsApp"
                checked={notifications.whatsappNotification}
                onChange={(v) =>
                  setNotifications({ ...notifications, whatsappNotification: v })
                }
              />

              <div className="flex justify-end pt-4">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTemplate?.id && templates.find((t) => t.id === editingTemplate.id)
                ? "Edit Template"
                : "New Template"}
            </DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={editingTemplate.name}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, name: e.target.value })
                  }
                  placeholder="e.g., Welcome Message"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={editingTemplate.category}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      category: e.target.value,
                    })
                  }
                  placeholder="e.g., onboarding, follow_up, sales"
                />
              </div>
              <div>
                <Label>Message Content</Label>
                <Textarea
                  value={editingTemplate.content}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      content: e.target.value,
                    })
                  }
                  placeholder="Use {name}, {time}, {policy_name}, {amount} as placeholders"
                  rows={5}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Placeholders: {"{name}"}, {"{time}"}, {"{policy_name}"},{" "}
                  {"{amount}"}, {"{date}"}, {"{benefits}"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTemplateModal(false);
                setEditingTemplate(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
