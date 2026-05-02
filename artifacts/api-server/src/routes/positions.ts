import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, positionsTable } from "@workspace/db";
import {
  ListPositionsResponse,
  CreatePositionBody,
  GetPositionParams,
  GetPositionResponse,
  UpdatePositionParams,
  UpdatePositionBody,
  UpdatePositionResponse,
  DeletePositionParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/positions", async (_req, res): Promise<void> => {
  const rows = await db.select().from(positionsTable).orderBy(positionsTable.createdAt);
  res.json(ListPositionsResponse.parse(rows));
});

router.post("/positions", async (req, res): Promise<void> => {
  const parsed = CreatePositionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [position] = await db.insert(positionsTable).values(parsed.data).returning();
  res.status(201).json(GetPositionResponse.parse(position));
});

router.get("/positions/:id", async (req, res): Promise<void> => {
  const params = GetPositionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [position] = await db.select().from(positionsTable).where(eq(positionsTable.id, params.data.id));
  if (!position) {
    res.status(404).json({ error: "Position not found" });
    return;
  }
  res.json(GetPositionResponse.parse(position));
});

router.patch("/positions/:id", async (req, res): Promise<void> => {
  const params = UpdatePositionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdatePositionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== null && v !== undefined) data[k] = v;
  }
  const [position] = await db.update(positionsTable).set(data).where(eq(positionsTable.id, params.data.id)).returning();
  if (!position) {
    res.status(404).json({ error: "Position not found" });
    return;
  }
  res.json(UpdatePositionResponse.parse(position));
});

router.delete("/positions/:id", async (req, res): Promise<void> => {
  const params = DeletePositionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(positionsTable).where(eq(positionsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
