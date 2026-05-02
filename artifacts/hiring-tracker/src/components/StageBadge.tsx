import { cn } from "@/lib/utils";

const stageConfig: Record<string, { label: string; className: string }> = {
  applied: { label: "Applied", className: "bg-slate-100 text-slate-700 border-slate-200" },
  screening: { label: "Screening", className: "bg-blue-50 text-blue-700 border-blue-200" },
  technical: { label: "Technical", className: "bg-purple-50 text-purple-700 border-purple-200" },
  hr_interview: { label: "HR Interview", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  final_interview: { label: "Final Interview", className: "bg-orange-50 text-orange-700 border-orange-200" },
  offer: { label: "Offer", className: "bg-amber-50 text-amber-700 border-amber-200" },
  hired: { label: "Hired", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-700 border-red-200" },
  withdrawn: { label: "Withdrawn", className: "bg-gray-50 text-gray-600 border-gray-200" },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  on_hold: { label: "On Hold", className: "bg-amber-50 text-amber-700 border-amber-200" },
  archived: { label: "Archived", className: "bg-slate-50 text-slate-600 border-slate-200" },
};

const positionStatusConfig: Record<string, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  paused: { label: "Paused", className: "bg-amber-50 text-amber-700 border-amber-200" },
  closed: { label: "Closed", className: "bg-slate-50 text-slate-600 border-slate-200" },
};

const interviewStatusConfig: Record<string, { label: string; className: string }> = {
  scheduled: { label: "Scheduled", className: "bg-blue-50 text-blue-700 border-blue-200" },
  completed: { label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", className: "bg-red-50 text-red-700 border-red-200" },
  no_show: { label: "No Show", className: "bg-orange-50 text-orange-700 border-orange-200" },
};

const recommendationConfig: Record<string, { label: string; className: string }> = {
  strong_yes: { label: "Strong Yes", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  yes: { label: "Yes", className: "bg-green-50 text-green-700 border-green-200" },
  neutral: { label: "Neutral", className: "bg-slate-50 text-slate-600 border-slate-200" },
  no: { label: "No", className: "bg-orange-50 text-orange-700 border-orange-200" },
  strong_no: { label: "Strong No", className: "bg-red-50 text-red-700 border-red-200" },
};

interface BadgeProps {
  value: string;
  type?: "stage" | "status" | "position-status" | "interview-status" | "recommendation";
  className?: string;
}

export function StageBadge({ value, type = "stage", className }: BadgeProps) {
  const config =
    type === "stage" ? stageConfig :
    type === "status" ? statusConfig :
    type === "position-status" ? positionStatusConfig :
    type === "interview-status" ? interviewStatusConfig :
    recommendationConfig;

  const item = config[value] ?? { label: value, className: "bg-slate-50 text-slate-600 border-slate-200" };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        item.className,
        className
      )}
    >
      {item.label}
    </span>
  );
}
