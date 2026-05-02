import { useGetDashboardSummary, useGetPipelineStats, useGetRecentActivity } from "@workspace/api-client-react";
import { Users, Briefcase, Calendar, CheckCircle, Clock, AlertCircle, TrendingUp, Activity } from "lucide-react";
import { StageBadge } from "@/components/StageBadge";
import { formatDistanceToNow } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const STAGE_COLORS: Record<string, string> = {
  applied: "#94a3b8",
  screening: "#60a5fa",
  technical: "#a78bfa",
  hr_interview: "#818cf8",
  final_interview: "#fb923c",
  offer: "#fbbf24",
  hired: "#34d399",
  rejected: "#f87171",
  withdrawn: "#cbd5e1",
};

export function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: pipeline, isLoading: pipelineLoading } = useGetPipelineStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();

  const metrics = [
    { label: "Total Candidates", value: summary?.totalCandidates ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Pipeline", value: summary?.activeCandidates ?? 0, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Open Positions", value: summary?.openPositions ?? 0, icon: Briefcase, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Hired This Month", value: summary?.hiredThisMonth ?? 0, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Scheduled Interviews", value: summary?.interviewsScheduled ?? 0, icon: Calendar, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Pending Feedback", value: summary?.pendingFeedback ?? 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Offers Pending", value: summary?.offersPending ?? 0, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Avg. Days to Hire", value: summary?.avgTimeToHire ? `${Math.round(summary.avgTimeToHire)}d` : "N/A", icon: Activity, color: "text-slate-600", bg: "bg-slate-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Hiring pipeline overview</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              data-testid={`metric-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{metric.label}</p>
                <div className={`p-1.5 rounded-md ${metric.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${metric.color}`} />
                </div>
              </div>
              {summaryLoading ? (
                <div className="h-7 w-12 bg-muted animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Pipeline Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline funnel */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Candidate Pipeline</h2>
          {pipelineLoading ? (
            <div className="h-48 bg-muted animate-pulse rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pipeline ?? []} layout="vertical" margin={{ left: 80, right: 20, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="label" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip
                  formatter={(value: number) => [`${value} candidates`, "Count"]}
                  contentStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                  {(pipeline ?? []).map((entry) => (
                    <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage] ?? "#94a3b8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h2>
          {activityLoading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : !activity || activity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[240px]">
              {activity.map((item) => (
                <div
                  key={item.id}
                  data-testid={`activity-item-${item.id}`}
                  className="flex items-start gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">{item.description}</p>
                    {item.positionTitle && (
                      <p className="text-xs text-muted-foreground">{item.positionTitle}</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex-shrink-0 pt-0.5">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stage breakdown table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Stage Breakdown</h2>
        </div>
        <div className="divide-y divide-border">
          {pipelineLoading ? (
            <div className="p-5">
              <div className="space-y-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                ))}
              </div>
            </div>
          ) : (
            (pipeline ?? []).filter(s => s.count > 0).map((stat) => (
              <div key={stat.stage} className="flex items-center justify-between px-5 py-3">
                <StageBadge value={stat.stage} type="stage" />
                <span className="text-sm font-semibold text-foreground">{stat.count}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
