import { useListFeedback } from "@workspace/api-client-react";
import { MessageSquare } from "lucide-react";
import { StageBadge } from "@/components/StageBadge";
import { StarRating } from "@/components/StarRating";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

export function Feedback() {
  const { data: feedback, isLoading } = useListFeedback({});

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Feedback</h1>
        <p className="text-sm text-muted-foreground mt-1">{feedback?.length ?? 0} feedback record{feedback?.length !== 1 ? "s" : ""}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />)}
        </div>
      ) : !feedback || feedback.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <MessageSquare className="w-10 h-10 text-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No feedback yet</p>
          <p className="text-sm text-muted-foreground mt-1">Feedback is submitted from candidate profiles after interviews</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedback.map((fb) => (
            <div
              key={fb.id}
              data-testid={`card-feedback-${fb.id}`}
              className="bg-card border border-border rounded-lg p-5"
            >
              <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                <div>
                  {fb.candidateName && (
                    <Link href={`/candidates/${fb.candidateId}`}>
                      <span className="text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">{fb.candidateName}</span>
                    </Link>
                  )}
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <p className="text-xs text-muted-foreground">Reviewed by {fb.reviewerName}</p>
                    {fb.interviewType && (
                      <span className="text-xs text-muted-foreground">·  {fb.interviewType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      · {formatDistanceToNow(new Date(fb.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StarRating value={fb.rating} size="md" />
                  <StageBadge value={fb.recommendation} type="recommendation" />
                </div>
              </div>

              {(fb.technicalScore || fb.culturalScore || fb.communicationScore) && (
                <div className="flex items-center gap-4 mb-3 p-2 bg-muted/40 rounded-md">
                  {fb.technicalScore && (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Technical</p>
                      <p className="text-sm font-bold text-foreground">{fb.technicalScore}/5</p>
                    </div>
                  )}
                  {fb.culturalScore && (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Culture Fit</p>
                      <p className="text-sm font-bold text-foreground">{fb.culturalScore}/5</p>
                    </div>
                  )}
                  {fb.communicationScore && (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Communication</p>
                      <p className="text-sm font-bold text-foreground">{fb.communicationScore}/5</p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {fb.strengths && (
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-semibold text-emerald-600 mt-0.5">+</span>
                    <p className="text-sm text-foreground">{fb.strengths}</p>
                  </div>
                )}
                {fb.weaknesses && (
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-semibold text-red-600 mt-0.5">-</span>
                    <p className="text-sm text-foreground">{fb.weaknesses}</p>
                  </div>
                )}
                {fb.notes && (
                  <p className="text-xs text-muted-foreground border-t border-border pt-2 mt-2">{fb.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
