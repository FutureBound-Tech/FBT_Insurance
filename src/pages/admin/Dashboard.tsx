import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Users,
  UserPlus,
  TrendingUp,
  Target,
  Plus,
  Clock,
  CheckSquare,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { api } from "@/lib/api";
import {
  cn,
  formatNumber,
  getLeadStatusColor,
  getLeadStatusLabel,
  getLeadScoreColor,
} from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const FUNNEL_COLORS = [
  "#3b82f6",
  "#eab308",
  "#a855f7",
  "#f97316",
  "#22c55e",
  "#ef4444",
];
const SOURCE_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ef4444"];
const SECTOR_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f97316",
  "#a855f7",
  "#ef4444",
  "#eab308",
  "#06b6d4",
  "#ec4899",
];

function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <>{formatNumber(count)}</>;
}

const statsConfig = [
  {
    label: "Total Leads",
    key: "totalLeads",
    icon: Users,
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    growthKey: "leadsGrowth",
  },
  {
    label: "New This Month",
    key: "newLeadsThisMonth",
    icon: UserPlus,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50",
    growthKey: "newLeadsGrowth",
  },
  {
    label: "Converted This Month",
    key: "convertedThisMonth",
    icon: TrendingUp,
    color: "bg-violet-500",
    lightColor: "bg-violet-50",
    growthKey: "convertedGrowth",
  },
  {
    label: "Conversion Rate",
    key: "conversionRate",
    icon: Target,
    color: "bg-amber-500",
    lightColor: "bg-amber-50",
    isPercent: true,
    growthKey: "conversionGrowth",
  },
];

const funnelStages = [
  { key: "new", label: "New" },
  { key: "interested", label: "Interested" },
  { key: "in_progress", label: "In Progress" },
  { key: "follow_up", label: "Follow Up" },
  { key: "converted", label: "Converted" },
  { key: "lost", label: "Lost" },
];

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: () => api.analytics.dashboard(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-8 w-20 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-64 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6 text-center">
          <p className="text-red-500 font-medium">Failed to load dashboard data</p>
          <p className="text-sm text-gray-500 mt-1">Please try refreshing the page</p>
        </Card>
      </div>
    );
  }

  const stats = data?.stats || {};
  const conversionFunnel = data?.conversionFunnel || [];
  const leadsOverTime = data?.leadsOverTime || [];
  const leadsBySource = data?.leadsBySource || [];
  const leadsBySector = data?.leadsBySector || [];
  const recentLeads = data?.recentLeads || [];
  const pendingFollowUps = data?.pendingFollowUps || [];
  const todaysTasks = data?.todaysTasks || [];

  const funnelData = funnelStages.map((stage) => {
    const found = conversionFunnel.find((f: any) => f.status === stage.key);
    return { name: stage.label, value: found?.count || 0 };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Here's your performance overview.
          </p>
        </div>
        <Link to="/agent-dashboard/leads">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Lead
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((cfg) => {
          const Icon = cfg.icon;
          const value = stats[cfg.key] || 0;
          const growth = stats[cfg.growthKey] || 0;
          const isPositive = growth >= 0;

          const borderColors: Record<string, string> = {
            "bg-blue-500": "border-l-blue-500",
            "bg-emerald-500": "border-l-emerald-500",
            "bg-violet-500": "border-l-violet-500",
            "bg-amber-500": "border-l-amber-500",
          };

          const iconBgs: Record<string, string> = {
            "bg-blue-500": "from-blue-500 to-blue-600",
            "bg-emerald-500": "from-emerald-500 to-emerald-600",
            "bg-violet-500": "from-violet-500 to-violet-600",
            "bg-amber-500": "from-amber-500 to-amber-600",
          };

          return (
            <Card key={cfg.key} className={cn("overflow-hidden border-l-4", borderColors[cfg.color])}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{cfg.label}</p>
                  <div className={cn("rounded-xl p-2.5 bg-gradient-to-br shadow-sm", iconBgs[cfg.color])}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-3xl font-extrabold text-gray-900">
                    <AnimatedCounter target={value} />
                    {cfg.isPercent ? "%" : ""}
                  </p>
                  <div className="flex items-center mt-1.5">
                    {isPositive ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        isPositive ? "text-emerald-600" : "text-red-600"
                      )}
                    >
                      {isPositive ? "+" : ""}
                      {growth}%
                    </span>
                    <span className="text-xs text-gray-400 ml-1">vs last month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Conversion Funnel</h3>
          </div>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {funnelData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Leads Over Time (Last 30 Days)</h3>
          </div>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={leadsOverTime} margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                <Legend />
                <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} dot={false} name="New Leads" />
                <Line type="monotone" dataKey="conversions" stroke="#22c55e" strokeWidth={2} dot={false} name="Conversions" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Leads by Source</h3>
          </div>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={leadsBySource} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="count" nameKey="source" label={({ source, count }: any) => `${source}: ${count}`}>
                  {leadsBySource.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Leads by Sector</h3>
          </div>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leadsBySector}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sector" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {leadsBySector.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Pending Follow-ups</h3>
          </div>
          <CardContent>
            {pendingFollowUps.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No pending follow-ups</p>
            ) : (
              <div className="space-y-3">
                {pendingFollowUps.slice(0, 5).map((fu: any) => (
                  <div key={fu.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{fu.lead?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500">{fu.type}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(fu.scheduledAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                <Link to="/agent-dashboard/follow-ups">
                  <Button variant="outline" size="sm" className="w-full">
                    View All ({pendingFollowUps.length})
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Today's Tasks</h3>
          </div>
          <CardContent>
            {todaysTasks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No tasks for today</p>
            ) : (
              <div className="space-y-3">
                {todaysTasks.slice(0, 5).map((task: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <CheckSquare className="h-4 w-4 text-blue-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Lead Score Distribution</h3>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[
                { label: "High (80-100)", range: [80, 100], color: "bg-green-500" },
                { label: "Medium (60-79)", range: [60, 79], color: "bg-yellow-500" },
                { label: "Low (40-59)", range: [40, 59], color: "bg-orange-500" },
                { label: "Very Low (0-39)", range: [0, 39], color: "bg-red-500" },
              ].map((bucket) => {
                const count = recentLeads.filter(
                  (l: any) => l.score >= bucket.range[0] && l.score <= bucket.range[1]
                ).length;
                const pct = recentLeads.length > 0 ? (count / recentLeads.length) * 100 : 0;
                return (
                  <div key={bucket.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{bucket.label}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <Progress value={pct} className={cn("h-2", bucket.color)} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Leads</CardTitle>
        <Link to="/agent-dashboard/leads">
            <Button variant="ghost" size="sm">
              View All
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Phone</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Sector</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Score</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No recent leads found
                    </td>
                  </tr>
                ) : (
                  recentLeads.slice(0, 10).map((lead: any) => (
                    <tr
                      key={lead.id}
                      className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => (window.location.href = `/agent-dashboard/leads/${lead.id}`)}
                    >
                      <td className="py-3 px-2">
                        <Link to={`/agent-dashboard/leads/${lead.id}`} className="font-medium hover:text-blue-600">
                          {lead.name}
                        </Link>
                      </td>
                      <td className="py-3 px-2 text-gray-600">{lead.phone}</td>
                      <td className="py-3 px-2 text-gray-600">{lead.sector}</td>
                      <td className="py-3 px-2">
                        <Badge className={getLeadStatusColor(lead.status)}>
                          {getLeadStatusLabel(lead.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <span className={getLeadScoreColor(lead.score)}>{lead.score}</span>
                      </td>
                      <td className="py-3 px-2 text-gray-600">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
