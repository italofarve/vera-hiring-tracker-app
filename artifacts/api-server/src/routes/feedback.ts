import { Router, type IRouter } from "express";
import { eq, and, type SQL } from "drizzle-orm";
import { db, feedbackTable, candidatesTable, interviewsTable, activityTable } from "@workspace/db";
import {
  ListFeedbackResponse,
  ListFeedbackQueryParams,
  CreateFeedbackBody,
  UpdateFeedbackParams,
  UpdateFeedbackBody,
  UpdateFeedbackResponse,
  DeleteFeedbackParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/feedback", async (req, res): Promise<void> => {
  const qp = ListFeedbackQueryParams.safeParse(req.query);
  if (!qp.success) {
    res.status(400).json({ error: qp.error.message });
    return;
  }

  const filters: SQL[] = [];
  if (qp.data.interviewId) filters.push(eq(feedbackTable.interviewId, qp.data.interviewId));
  if (qp.data.candidateId) filters.push(eq(feedbackTable.candidateId, qp.data.candidateId));

  const rows = await db
    .select({
      id: feedbackTable.id,
      interviewId: feedbackTable.interviewId,
      candidateId: feedbackTable.candidateId,
      candidateName: candidatesTable.firstName,
      interviewType: interviewsTable.type,
      reviewerName: feedbackTable.reviewerName,
      reviewerEmail: feedbackTable.reviewerEmail,
      rating: feedbackTable.rating,
      technicalScore: feedbackTable.technicalScore,
      culturalScore: feedbackTable.culturalScore,
      communicationScore: feedbackTable.communicationScore,
      strengths: feedbackTable.strengths,
      weaknesses: feedbackTable.weaknesses,
      recommendation: feedbackTable.recommendation,
      notes: feedbackTable.notes,
      createdAt: feedbackTable.createdAt,
    })
    .from(feedbackTable)
    .leftJoin(candidatesTable, eq(feedbackTable.candidateId, candidatesTable.id))
    .leftJoin(interviewsTable, eq(feedbackTable.interviewId, interviewsTable.id))
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(feedbackTable.createdAt);

  const enriched = rows.map((r) => ({
    ...r,
    candidateName: r.candidateName || null,
  }));

  res.json(ListFeedbackResponse.parse(enriched));
});

router.post("/feedback", async (req, res): Promise<void> => {
  const parsed = CreateFeedbackBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [fb] = await db.insert(feedbackTable).values(parsed.data).returning();

  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, fb.candidateId));
  if (candidate) {
    await db.insert(activityTable).values({
      type: "feedback_submitted",
      description: `Feedback submitted for ${candidate.firstName} ${candidate.lastName} by ${fb.reviewerName}`,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      positionTitle: null,
    });
  }

  res.status(201).json({ ...fb, candidateName: null, interviewType: null });
});

router.patch("/feedback/:id", async (req, res): Promise<void> => {
  const params = UpdateFeedbackParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateFeedbackBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== null && v !== undefined) data[k] = v;
  }

  const [updated] = await db.update(feedbackTable).set(data).where(eq(feedbackTable.id, params.data.id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Feedback not found" });
    return;
  }

  res.json(UpdateFeedbackResponse.parse({ ...updated, candidateName: null, interviewType: null }));
});

router.delete("/feedback/:id", async (req, res): Promise<void> => {
  const params = DeleteFeedbackParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(feedbackTable).where(eq(feedbackTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
