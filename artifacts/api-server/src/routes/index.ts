import { Router, type IRouter } from "express";
import healthRouter from "./health";
import positionsRouter from "./positions";
import candidatesRouter from "./candidates";
import interviewsRouter from "./interviews";
import feedbackRouter from "./feedback";
import dashboardRouter from "./dashboard";
import cvRouter from "./cv";
import portalRouter from "./portal";
import accessRouter from "./access";
import { requireAllowedEmail } from "../middlewares/requireAllowedEmail";

const router: IRouter = Router();

// Public routes (no auth, no allowlist)
router.use(healthRouter);
router.use(portalRouter);

// Auth routes (own auth handling, NO allowlist gate — used to *report* the
// gate decision to the client).
router.use(accessRouter);

// All HR-facing business routes are gated: must be authenticated AND
// the authenticated email must be on the Google Sheet allowlist.
router.use(requireAllowedEmail());
router.use(positionsRouter);
router.use(candidatesRouter);
router.use(interviewsRouter);
router.use(feedbackRouter);
router.use(dashboardRouter);
router.use(cvRouter);

export default router;
