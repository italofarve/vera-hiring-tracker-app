import { Router, type IRouter } from "express";
import { eq, count, and, sql } from "drizzle-orm";
import { db, candidatesTable, positionsTable, interviewsTable, feedbackTable, activityTable } from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetPipelineStatsResponse,
  GetRecentActivityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [totalCandidatesResult] = await db.select({ count: count() }).from(candidatesTable);
  const [activeCandidatesResult] = await db
    .select({ count: count() })
    .from(candidatesTable)
    .where(eq(candidatesTable.status, "active"));

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [hiredThisMonthResult] = await db
    .select({ count: count() })
    .from(candidatesTable)
    .where(and(eq(candidatesTable.stage, "hired"), sql`${candidatesTable.updatedAt} >= ${firstOfMonth}`));

  const [openPositionsResult] = await db
    .select({ count: count() })
    .from(positionsTable)
    .where(eq(positionsTable.status, "open"));

  const [interviewsScheduledResult] = await db
    .select({ count: count() })
    .from(interviewsTable)
    .where(eq(interviewsTable.status, "scheduled"));

  const completedInterviews = await db
    .select({ id: interviewsTable.id })
    .from(interviewsTable)
    .where(eq(interviewsTable.status, "completed"));
  const completedIds = completedInterviews.map((i) => i.id);

  let pendingFeedback = 0;
  if (completedIds.length > 0) {
    const feedbackGiven = await db
      .select({ interviewId: feedbackTable.interviewId })
      .from(feedbackTable)
      .where(sql`${feedbackTable.interviewId} = ANY(ARRAY[${sql.raw(completedIds.join(","))}])`);
    const feedbackIds = new Set(feedbackGiven.map((f) => f.interviewId));
    pendingFeedback = completedIds.filter((id) => !feedbackIds.has(id)).length;
  }

  const [offersPendingResult] = await db
    .select({ count: count() })
    .from(candidatesTable)
    .where(eq(candidatesTable.stage, "offer"));

  const summary = {
    totalCandidates: totalCandidatesResult?.count ?? 0,
    activeCandidates: activeCandidatesResult?.count ?? 0,
    hiredThisMonth: hiredThisMonthResult?.count ?? 0,
    openPositions: openPositionsResult?.count ?? 0,
    interviewsScheduled: interviewsScheduledResult?.count ?? 0,
    pendingFeedback,
    offersPending: offersPendingResult?.count ?? 0,
    avgTimeToHire: null,
  };

  res.json(GetDashboardSummaryResponse.parse(summary));
});

router.get("/dashboard/pipeline", async (_req, res): Promise<void> => {
  const stages = ["applied", "screening", "technical", "hr_interview", "final_interview", "offer", "hired", "rejected", "withdrawn"];
  const labels: Record<string, string> = {
    applied: "Applied",
    screening: "Screening",
    technical: "Technical",
    hr_interview: "HR Interview",
    final_interview: "Final Interview",
    offer: "Offer",
    hired: "Hired",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
  };

  const rows = await db
    .select({ stage: candidatesTable.stage, count: count() })
    .from(candidatesTable)
    .groupBy(candidatesTable.stage);

  const countMap = new Map(rows.map((r) => [r.stage, Number(r.count)]));

  const stats = stages.map((stage) => ({
    stage,
    count: countMap.get(stage) ?? 0,
    label: labels[stage] ?? stage,
  }));

  res.json(GetPipelineStatsResponse.parse(stats));
});

router.get("/dashboard/recent-activity", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(activityTable)
    .orderBy(sql`${activityTable.timestamp} DESC`)
    .limit(20);

  res.json(GetRecentActivityResponse.parse(rows));
});

export default router;
