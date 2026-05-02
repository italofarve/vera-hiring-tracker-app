import { useListInterviews, useUpdateInterview, getListInterviewsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar, Video, Phone, MapPin, User, Clock } from "lucide-react";
import { StageBadge } from "@/components/StageBadge";
import { format, isPast } from "date-fns";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const locationIcons: Record<string, typeof Video> = {
  video_call: Video,
  phone: Phone,
  on_site: MapPin,
};

export function Interviews() {
  const { data: interviews, isLoading } = useListInterviews({});
  const updateInterview = useUpdateInterview();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (id: number, status: string) => {
    updateInterview.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListInterviewsQueryKey({}) });
          toast({ title: "Interview status updated" });
        },
      }
    );
  };

  const upcoming = (interviews ?? []).filter(i => i.status === "scheduled");
  const past = (interviews ?? []).filter(i => i.status !== "scheduled");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Interviews</h1>
        <p className="text-sm text-muted-foreground mt-1">{upcoming.length} upcoming · {past.length} completed</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}
        </div>
      ) : (interviews ?? []).length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Calendar className="w-10 h-10 text-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No interviews scheduled</p>
          <p className="text-sm text-muted-foreground mt-1">Schedule interviews from a candidate profile</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Upcoming ({upcoming.length})</h2>
              <div className="space-y-3">
                {upcoming.map((interview) => {
                  const LocationIcon = interview.location ? locationIcons[interview.location] ?? MapPin : Calendar;
                  return (
                    <div
                      key={interview.id}
                      data-testid={`card-interview-${interview.id}`}
                      className="bg-card border border-border rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-foreground">
                              {interview.type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                            </p>
                            <StageBadge value={interview.status} type="interview-status" />
                          </div>
                          {interview.candidateName && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                              <User className="w-3.5 h-3.5" />
                              <Link href={`/candidates/${interview.candidateId}`}>
                                <span className="hover:text-primary transition-colors cursor-pointer">{interview.candidateName}</span>
                              </Link>
                              {interview.positionTitle && <span>— {interview.positionTitle}</span>}
                            </div>
                          )}
                          <div className="flex items-center gap-4 flex-wrap">
                            {interview.scheduledAt && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(interview.scheduledAt), "MMM d, yyyy 'at' h:mm a")}
                              </div>
                            )}
                            {interview.durationMinutes && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {interview.durationMinutes} min
                              </div>
                            )}
                            {interview.location && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <LocationIcon className="w-3 h-3" />
                                {interview.location.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                              </div>
                            )}
                          </div>
                          {interview.interviewerName && (
                            <p className="text-xs text-muted-foreground mt-1">with {interview.interviewerName}</p>
                          )}
                        </div>
                        <Select value={interview.status} onValueChange={(v) => handleStatusChange(interview.id, v)}>
                          <SelectTrigger data-testid={`select-interview-status-${interview.id}`} className="w-[140px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="no_show">No Show</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Past ({past.length})</h2>
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Candidate</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {past.map((interview) => (
                      <tr key={interview.id} data-testid={`row-past-interview-${interview.id}`} className="hover:bg-muted/20">
                        <td className="px-4 py-3">
                          {interview.candidateName ? (
                            <Link href={`/candidates/${interview.candidateId}`}>
                              <span className="text-sm text-foreground hover:text-primary cursor-pointer">{interview.candidateName}</span>
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {interview.type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                          {interview.scheduledAt ? format(new Date(interview.scheduledAt), "MMM d, yyyy") : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <StageBadge value={interview.status} type="interview-status" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
