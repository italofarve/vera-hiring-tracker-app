import type { RequestHandler } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { isEmailAllowed } from "../lib/allowedEmails";

const EMAIL_CACHE_TTL_MS = 10 * 60 * 1000;
const userEmailCache = new Map<string, { email: string; ts: number }>();

export const DENIED_MESSAGE =
  "Acceso denegado, sólo los usuarios del Laboratorio 7 de IA Generativa - IE pueden registrarse e iniciar sesión.";

async function resolveAuthenticatedEmail(userId: string): Promise<string | null> {
  const now = Date.now();
  const cached = userEmailCache.get(userId);
  if (cached && now - cached.ts < EMAIL_CACHE_TTL_MS) {
    return cached.email;
  }
  try {
    const user = await clerkClient.users.getUser(userId);
    const primaryId = user.primaryEmailAddressId;
    const emailObj =
      user.emailAddresses.find((e) => e.id === primaryId) ||
      user.emailAddresses[0];
    const email = (emailObj?.emailAddress || "").trim().toLowerCase();
    if (!email) return null;
    userEmailCache.set(userId, { email, ts: now });
    return email;
  } catch (err) {
    return null;
  }
}

export function getAuthenticatedEmail(): RequestHandler {
  return async (req, res, next) => {
    const auth = getAuth(req);
    const userId = auth.userId;
    if (!userId) {
      (req as unknown as { authEmail?: string }).authEmail = undefined;
      return next();
    }
    const email = await resolveAuthenticatedEmail(userId);
    (req as unknown as { authEmail?: string }).authEmail = email || undefined;
    next();
  };
}

export function requireAllowedEmail(): RequestHandler {
  return async (req, res, next) => {
    const auth = getAuth(req);
    if (!auth.userId) {
      res.status(401).json({
        error: "unauthenticated",
        message: "Authentication required",
      });
      return;
    }
    const email = await resolveAuthenticatedEmail(auth.userId);
    if (!email) {
      res.status(403).json({
        error: "no_email",
        message: DENIED_MESSAGE,
      });
      return;
    }
    const allowed = await isEmailAllowed(email);
    if (!allowed) {
      res.status(403).json({
        error: "not_allowlisted",
        message: DENIED_MESSAGE,
        email,
      });
      return;
    }
    (req as unknown as { authEmail?: string }).authEmail = email;
    next();
  };
}
