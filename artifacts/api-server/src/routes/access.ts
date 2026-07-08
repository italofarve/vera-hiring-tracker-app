import { Router, type IRouter } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import {
  isEmailAllowed,
  getAllowedEmailsStatus,
  refreshAllowedEmails,
} from "../lib/allowedEmails";

const router: IRouter = Router();

async function resolveEmailFromAuth(
  userId: string,
): Promise<string | null> {
  try {
    const user = await clerkClient.users.getUser(userId);
    const primaryId = user.primaryEmailAddressId;
    const emailObj =
      user.emailAddresses.find((e) => e.id === primaryId) ||
      user.emailAddresses[0];
    return (emailObj?.emailAddress || "").trim().toLowerCase() || null;
  } catch {
    return null;
  }
}

/**
 * GET /api/access/check
 * Authoritative allowlist check based on the authenticated Clerk session.
 * Always uses the verified session email — no spoofable query param.
 */
router.get("/access/check", async (req, res) => {
  const auth = getAuth(req);
  if (!auth.userId) {
    res.status(401).json({ allowed: false, error: "unauthenticated" });
    return;
  }
  const email = await resolveEmailFromAuth(auth.userId);
  if (!email) {
    res.status(502).json({ allowed: false, error: "user_lookup_failed" });
    return;
  }
  const isAllowlistDisabled = process.env.DISABLE_ALLOWLIST === "true";
  const allowed = isAllowlistDisabled ? true : await isEmailAllowed(email);
  res.json({ allowed, email });
});

/**
 * GET /api/access/status
 * Returns allowlist metadata. Requires authentication so it can't be used
 * to silently probe the allowlist size.
 */
router.get("/access/status", async (req, res) => {
  const auth = getAuth(req);
  if (!auth.userId) {
    res.status(401).json({ error: "unauthenticated" });
    return;
  }
  const status = await getAllowedEmailsStatus();
  res.json(status);
});

/**
 * POST /api/access/reload
 * Force-refresh the allowlist cache. Caller must be on the allowlist.
 */
router.post("/access/reload", async (req, res) => {
  const auth = getAuth(req);
  if (!auth.userId) {
    res.status(401).json({ error: "unauthenticated" });
    return;
  }
  const email = await resolveEmailFromAuth(auth.userId);
  if (!email) {
    res.status(502).json({ error: "user_lookup_failed" });
    return;
  }
  const isAllowlistDisabled = process.env.DISABLE_ALLOWLIST === "true";
  if (!isAllowlistDisabled && !(await isEmailAllowed(email))) {
    res.status(403).json({ error: "not_allowlisted" });
    return;
  }
  const result = await refreshAllowedEmails();
  res.json(result);
});

export default router;
