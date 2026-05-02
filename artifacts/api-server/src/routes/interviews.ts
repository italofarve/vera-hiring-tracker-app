import { Router, type IRouter } from "express";
import { eq, and, type SQL } from "drizzle-orm";
import { db, interviewsTable, candidatesTable, positionsTable, activityTable } from "@workspace/db";
import { sendNotification } from "../lib/notify";
import {
  ListInterviewsResponse,
  ListInterviewsQueryParams,
  CreateInterviewBody,
  GetInterviewParams,
  GetInterviewResponse,
  UpdateInterviewParams,
  UpdateInterviewBody,
  UpdateInterviewResponse,
  DeleteInterviewParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/interviews", async (req, res): Promise<void> => {
  const qp = ListInterviewsQueryParams.safeParse(req.query);
  if (!qp.success) {
    res.status(400).json({ error: qp.error.message });
    return;
  }

  const filters: SQL[] = [];
  if (qp.data.candidateId) filters.push(eq(interviewsTable.candidateId, qp.data.candidateId));

  const rows = await db
    .select({
      id: interviewsTable.id,
      candidateId: interviewsTable.candidateId,
      candidateName: candidatesTable.firstName,
      positionTitle: positionsTable.title,
      type: interviewsTable.type,
      scheduledAt: interviewsTable.scheduledAt,
      durationMinutes: interviewsTable.durationMinutes,
      interviewerName: interviewsTable.interviewerName,
      interviewerEmail: interviewsTable.interviewerEmail,
      location: interviewsTable.location,
      meetingUrl: interviewsTable.meetingUrl,
      status: interviewsTable.status,
      notes: interviewsTable.notes,
      createdAt: interviewsTable.createdAt,
    })
    .from(interviewsTable)
    .leftJoin(candidatesTable, eq(interviewsTable.candidateId, candidatesTable.id))
    .leftJoin(positionsTable, eq(candidatesTable.positionId, positionsTable.id))
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(interviewsTable.scheduledAt);

  const enriched = rows.map((r) => ({
    ...r,
    candidateName: r.candidateName ? `${r.candidateName}` : null,
  }));

  res.json(ListInterviewsResponse.parse(enriched));
});

router.post("/interviews", async (req, res): Promise<void> => {
  const parsed = CreateInterviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [interview] = await db.insert(interviewsTable).values(parsed.data).returning();

  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, interview.candidateId));
  if (candidate) {
    let posTitle: string | undefined;
    if (candidate.positionId) {
      const [pos] = await db.select({ title: positionsTable.title }).from(positionsTable).where(eq(positionsTable.id, candidate.positionId));
      posTitle = pos?.title;
    }
    await db.insert(activityTable).values({
      type: "interview_scheduled",
      description: `Interview scheduled for ${candidate.firstName} ${candidate.lastName}`,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      positionTitle: posTitle ?? null,
    });
    sendNotification({
      type: "interview_scheduled",
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      candidateEmail: candidate.email,
      interviewType: interview.type,
      scheduledAt: interview.scheduledAt?.toISOString(),
      positionTitle: posTitle,
    }).catch(() => {});
  }

  res.status(201).json(GetInterviewResponse.parse({ ...interview, candidateName: null, positionTitle: null }));
});

router.get("/interviews/:id", async (req, res): Promise<void> => {
  const params = GetInterviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select({
      id: interviewsTable.id,
      candidateId: interviewsTable.candidateId,
      candidateName: candidatesTable.firstName,
      positionTitle: positionsTable.title,
      type: interviewsTable.type,
      scheduledAt: interviewsTable.scheduledAt,
      durationMinutes: interviewsTable.durationMinutes,
      interviewerName: interviewsTable.interviewerName,
      interviewerEmail: interviewsTable.interviewerEmail,
      location: interviewsTable.location,
      meetingUrl: interviewsTable.meetingUrl,
      status: interviewsTable.status,
      notes: interviewsTable.notes,
      createdAt: interviewsTable.createdAt,
    })
    .from(interviewsTable)
    .leftJoin(candidatesTable, eq(interviewsTable.candidateId, candidatesTable.id))
    .leftJoin(positionsTable, eq(candidatesTable.positionId, positionsTable.id))
    .where(eq(interviewsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Interview not found" });
    return;
  }

  res.json(GetInterviewResponse.parse({ ...row, candidateName: row.candidateName || null }));
});

router.patch("/interviews/:id", async (req, res): Promise<void> => {
  const params = UpdateInterviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateInterviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== null && v !== undefined) data[k] = v;
  }

  const [updated] = await db.update(interviewsTable).set(data).where(eq(interviewsTable.id, params.data.id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Interview not found" });
    return;
  }

  res.json(UpdateInterviewResponse.parse({ ...updated, candidateName: null, positionTitle: null }));
});

router.delete("/interviews/:id", async (req, res): Promise<void> => {
  const params = DeleteInterviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(interviewsTable).where(eq(interviewsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
