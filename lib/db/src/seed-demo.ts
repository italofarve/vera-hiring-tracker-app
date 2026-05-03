import { sql } from "drizzle-orm";
import { db, pool } from "./index.ts";
import { positionsTable, candidatesTable, activityTable } from "./schema/index.ts";

/**
 * Inserts demo positions and candidates when the DB is empty (no rows in `positions`).
 * Safe to run multiple times; skips if any position already exists.
 *
 * Usage (DATABASE_URL required):
 *   pnpm --filter @workspace/db run seed-demo
 */
async function main() {
  const [{ c }] = await db.select({ c: sql<number>`count(*)::int` }).from(positionsTable);

  if (c > 0) {
    console.log(`Seed skipped: database already has ${c} position(s).`);
    await pool.end();
    return;
  }

  const positions = await db
    .insert(positionsTable)
    .values([
      {
        title: "Senior Full Stack Engineer",
        department: "Engineering",
        location: "Madrid (hybrid)",
        type: "full-time",
        status: "open",
        headcount: 2,
        description: "Build hiring workflows, integrations, and reliability.",
      },
      {
        title: "Product Designer",
        department: "Design",
        location: "Remote (EU)",
        type: "full-time",
        status: "open",
        headcount: 1,
        description: "Own UX for candidate and recruiter experiences.",
      },
      {
        title: "People Operations Intern",
        department: "HR",
        location: "Madrid",
        type: "internship",
        status: "open",
        headcount: 1,
        description: "Support recruiting operations and employer branding.",
      },
    ])
    .returning({ id: positionsTable.id, title: positionsTable.title });

  const eng = positions[0]!;
  const design = positions[1]!;

  await db.insert(candidatesTable).values([
    {
      firstName: "Ana",
      lastName: "García",
      email: "ana.garcia.demo@example.com",
      phone: "+34 600 000 001",
      positionId: eng.id,
      stage: "screening",
      status: "active",
      source: "linkedin",
      notes: "Demo profile — safe to delete.",
    },
    {
      firstName: "Carlos",
      lastName: "Ruiz",
      email: "carlos.ruiz.demo@example.com",
      positionId: eng.id,
      stage: "technical",
      status: "active",
      source: "referral",
    },
    {
      firstName: "María",
      lastName: "López",
      email: "maria.lopez.demo@example.com",
      positionId: design.id,
      stage: "applied",
      status: "active",
      source: "job_board",
    },
  ]);

  await db.insert(activityTable).values([
    {
      type: "candidate_added",
      description: "Ana García added to pipeline",
      candidateName: "Ana García",
      positionTitle: eng.title,
    },
    {
      type: "candidate_added",
      description: "María López added to pipeline",
      candidateName: "María López",
      positionTitle: design.title,
    },
  ]);

  console.log(`Demo seed complete: ${positions.length} positions, 3 candidates, 2 activity rows.`);
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
