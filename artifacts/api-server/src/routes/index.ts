import { Router, type IRouter } from "express";
import healthRouter from "./health";
import scamGuardianRouter from "./scam-guardian";

const router: IRouter = Router();

router.use(healthRouter);
router.use(scamGuardianRouter);

export default router;
