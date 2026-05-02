import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { candidatesTable, positionsTable, activityTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { sendNotification } from "../lib/notify";

const router = Router();

router.get("/portal/positions", async (_req: Request, res: Response): Promise<void> => {
  const positions = await db
    .select()
    .from(positionsTable)
    .where(eq(positionsTable.status, "open"))
    .orderBy(positionsTable.createdAt);
  res.json(positions);
});

router.get("/portal/positions/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid position id" }); return; }
  const [position] = await db.select().from(positionsTable).where(eq(positionsTable.id, id));
  if (!position) { res.status(404).json({ error: "Position not found" }); return; }
  res.json(position);
});

router.post("/portal/apply", async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, phone, positionId, source, notes } = req.body;

  if (!firstName || !lastName || !email) {
    res.status(400).json({ error: "First name, last name and email are required" });
    return;
  }

  const existing = await db
    .select({ id: candidatesTable.id })
    .from(candidatesTable)
    .where(and(eq(candidatesTable.email, email), eq(candidatesTable.positionId, parseInt(positionId) || 0)));

  if (existing.length > 0) {
    res.status(409).json({ error: "An application with this email already exists for this position" });
    return;
  }

  let positionTitle: string | undefined;
  if (positionId) {
    const [pos] = await db.select({ title: positionsTable.title }).from(positionsTable).where(eq(positionsTable.id, parseInt(positionId)));
    positionTitle = pos?.title;
  }

  const [candidate] = await db
    .insert(candidatesTable)
    .values({
      firstName,
      lastName,
      email,
      phone: phone || null,
      positionId: positionId ? parseInt(positionId) : null,
      stage: "applied",
      status: "active",
      source: source || "portal",
      notes: notes || null,
    })
    .returning();

  await db.insert(activityTable).values({
    candidateId: candidate.id,
    positionId: positionId ? parseInt(positionId) : null,
    type: "stage_change",
    description: `${firstName} ${lastName} applied via the careers portal`,
    metadata: JSON.stringify({ stage: "applied" }),
  });

  await sendNotification({
    type: "application_received",
    candidateName: `${firstName} ${lastName}`,
    candidateEmail: email,
    positionTitle,
  });

  res.status(201).json({ id: candidate.id, message: "Application submitted successfully" });
});

export default router;
