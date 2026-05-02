import { Router, type IRouter } from "express";
import { eq, and, ilike, type SQL } from "drizzle-orm";
import { db, candidatesTable, positionsTable, activityTable } from "@workspace/db";
import { sendNotification } from "../lib/notify";
import {
  ListCandidatesResponse,
  ListCandidatesQueryParams,
  CreateCandidateBody,
  GetCandidateParams,
  GetCandidateResponse,
  UpdateCandidateParams,
  UpdateCandidateBody,
  UpdateCandidateResponse,
  DeleteCandidateParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/candidates", async (req, res): Promise<void> => {
  const qp = ListCandidatesQueryParams.safeParse(req.query);
  if (!qp.success) {
    res.status(400).json({ error: qp.error.message });
    return;
  }

  const filters: SQL[] = [];
  if (qp.data.positionId) filters.push(eq(candidatesTable.positionId, qp.data.positionId));
  if (qp.data.stage) filters.push(eq(candidatesTable.stage, qp.data.stage));
  if (qp.data.status) filters.push(eq(candidatesTable.status, qp.data.status));
  if (qp.data.search) {
    filters.push(ilike(candidatesTable.firstName, `%${qp.data.search}%`));
  }

  const rows = await db
    .select({
      id: candidatesTable.id,
      firstName: candidatesTable.firstName,
      lastName: candidatesTable.lastName,
      email: candidatesTable.email,
      phone: candidatesTable.phone,
      positionId: candidatesTable.positionId,
      positionTitle: positionsTable.title,
      department: positionsTable.department,
      stage: candidatesTable.stage,
      status: candidatesTable.status,
      source: candidatesTable.source,
      resumeUrl: candidatesTable.resumeUrl,
      notes: candidatesTable.notes,
      rating: candidatesTable.rating,
      createdAt: candidatesTable.createdAt,
      updatedAt: candidatesTable.updatedAt,
    })
    .from(candidatesTable)
    .leftJoin(positionsTable, eq(candidatesTable.positionId, positionsTable.id))
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(candidatesTable.createdAt);

  res.json(ListCandidatesResponse.parse(rows));
});

router.post("/candidates", async (req, res): Promise<void> => {
  const parsed = CreateCandidateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [candidate] = await db.insert(candidatesTable).values(parsed.data).returning();

  let positionTitle: string | null = null;
  if (candidate.positionId) {
    const [pos] = await db.select().from(positionsTable).where(eq(positionsTable.id, candidate.positionId));
    if (pos) positionTitle = pos.title;
  }

  await db.insert(activityTable).values({
    type: "candidate_added",
    description: `${candidate.firstName} ${candidate.lastName} added to pipeline`,
    candidateName: `${candidate.firstName} ${candidate.lastName}`,
    positionTitle,
  });

  res.status(201).json(GetCandidateResponse.parse({ ...candidate, positionTitle, department: null }));
});

router.get("/candidates/:id", async (req, res): Promise<void> => {
  const params = GetCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select({
      id: candidatesTable.id,
      firstName: candidatesTable.firstName,
      lastName: candidatesTable.lastName,
      email: candidatesTable.email,
      phone: candidatesTable.phone,
      positionId: candidatesTable.positionId,
      positionTitle: positionsTable.title,
      department: positionsTable.department,
      stage: candidatesTable.stage,
      status: candidatesTable.status,
      source: candidatesTable.source,
      resumeUrl: candidatesTable.resumeUrl,
      notes: candidatesTable.notes,
      rating: candidatesTable.rating,
      createdAt: candidatesTable.createdAt,
      updatedAt: candidatesTable.updatedAt,
    })
    .from(candidatesTable)
    .leftJoin(positionsTable, eq(candidatesTable.positionId, positionsTable.id))
    .where(eq(candidatesTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  res.json(GetCandidateResponse.parse(row));
});

router.patch("/candidates/:id", async (req, res): Promise<void> => {
  const params = UpdateCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCandidateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== null && v !== undefined) data[k] = v;
  }

  const [updated] = await db.update(candidatesTable).set(data).where(eq(candidatesTable.id, params.data.id)).returning();

  let positionTitleForNotify: string | undefined;
  if (existing.positionId) {
    const [pos] = await db.select({ title: positionsTable.title }).from(positionsTable).where(eq(positionsTable.id, existing.positionId));
    positionTitleForNotify = pos?.title;
  }

  if (parsed.data.stage && parsed.data.stage !== existing.stage) {
    await db.insert(activityTable).values({
      type: "stage_changed",
      description: `${existing.firstName} ${existing.lastName} moved to ${parsed.data.stage}`,
      candidateName: `${existing.firstName} ${existing.lastName}`,
      positionTitle: positionTitleForNotify ?? null,
    });
    sendNotification({
      type: "stage_changed",
      candidateName: `${existing.firstName} ${existing.lastName}`,
      candidateEmail: existing.email,
      stage: parsed.data.stage,
      positionTitle: positionTitleForNotify,
    }).catch(() => {});
    if (parsed.data.stage === "offer") {
      sendNotification({
        type: "offer_extended",
        candidateName: `${existing.firstName} ${existing.lastName}`,
        candidateEmail: existing.email,
        positionTitle: positionTitleForNotify,
      }).catch(() => {});
    }
  }

  let positionTitle: string | null = null;
  if (updated.positionId) {
    const [pos] = await db.select().from(positionsTable).where(eq(positionsTable.id, updated.positionId));
    if (pos) positionTitle = pos.title;
  }

  res.json(UpdateCandidateResponse.parse({ ...updated, positionTitle, department: null }));
});

router.delete("/candidates/:id", async (req, res): Promise<void> => {
  const params = DeleteCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(candidatesTable).where(eq(candidatesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
