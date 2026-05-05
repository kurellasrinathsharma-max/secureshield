import { Router, type IRouter } from "express";
import healthRouter from "./health";
import scamGuardianRouter from "./scam-guardian";
import authRouter from "./auth";
import threatFeedRouter from "./threat-feed";
import userSettingsRouter from "./user-settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(scamGuardianRouter);
router.use(threatFeedRouter);
router.use(userSettingsRouter);

export default router;
