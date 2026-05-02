import { useParams, useLocation } from "wouter";
import { useGetPosition, useListCandidates, getListCandidatesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StageBadge } from "@/components/StageBadge";
import { StarRating } from "@/components/StarRating";
import { Link } from "wouter";
import { getGetPositionQueryKey } from "@workspace/api-client-react";

export function PositionDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const positionId = parseInt(id);

  const { data: position, isLoading: posLoading } = useGetPosition(positionId, { query: { enabled: !!positionId, queryKey: getGetPositionQueryKey(positionId) } });
  const { data: candidates, isLoading: candLoading } = useListCandidates(
    { positionId },
    { query: { enabled: !!positionId, queryKey: getListCandidatesQueryKey({ positionId }) } }
  );

  if (posLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!position) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Position not found</p>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/positions")}>Back to Positions</Button>
      </div>
    );
  }

  const stageCounts = (candidates ?? []).reduce<Record<string, number>>((acc, c) => {
    acc[c.stage] = (acc[c.stage] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <button
          data-testid="button-back"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          onClick={() => setLocation("/positions")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Positions
        </button>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <h1 data-testid="text-position-title" className="text-xl font-bold text-foreground">{position.title}</h1>
              </div>
              <div className="flex items-center gap-3 ml-13 flex-wrap mt-2">
                <span className="text-sm text-muted-foreground">{position.department}</span>
                <span className="text-muted">·</span>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  {position.location}
                </div>
                <span className="text-muted">·</span>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  {position.headcount} headcount
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StageBadge value={position.status} type="position-status" />
              <span className="text-xs text-muted-foreground capitalize">{position.type.replace(/-/g, " ")}</span>
            </div>
          </div>
          {position.description && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-foreground">{position.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stage summary */}
      {Object.keys(stageCounts).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(stageCounts).map(([stage, count]) => (
            <div key={stage} className="bg-card border border-border rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-foreground">{count}</p>
              <StageBadge value={stage} type="stage" className="mt-1" />
            </div>
          ))}
        </div>
      )}

      {/* Candidates */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Candidates ({candidates?.length ?? 0})</h2>
        </div>
        {candLoading ? (
          <div className="p-6">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded mb-2" />)}
          </div>
        ) : !candidates || candidates.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No candidates for this position yet</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Candidate</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stage</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Rating</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {candidates.map((c) => (
                <tr key={c.id} data-testid={`row-position-candidate-${c.id}`} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-primary">{c.firstName[0]}{c.lastName[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.firstName} {c.lastName}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StageBadge value={c.stage} type="stage" /></td>
                  <td className="px-4 py-3 hidden sm:table-cell"><StarRating value={c.rating} /></td>
                  <td className="px-4 py-3">
                    <Link href={`/candidates/${c.id}`}>
                      <span className="text-xs text-primary hover:underline cursor-pointer">View</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
