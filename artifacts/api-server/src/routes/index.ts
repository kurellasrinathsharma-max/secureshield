import { Router, type IRouter } from "express";
import healthRouter from "./health";
import scamGuardianRouter from "./scam-guardian";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(scamGuardianRouter);

export default router;
