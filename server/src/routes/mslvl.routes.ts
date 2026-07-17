import { Router } from "express";
import { verifyToken, requireRole } from "../middleware/auth.middleware";
import { postCrewLog, fetchTodayCrewLog, postStartWork, postMarkCompleted, postVerifyClose } from "../controllers/mslvl.controller";

const router = Router();

router.post("/crew-log", verifyToken, requireRole("MSLVL"), postCrewLog);
router.get("/crew-log/today", verifyToken, requireRole("MSLVL"), fetchTodayCrewLog);
router.patch("/:id/start", verifyToken, requireRole("MSLVL"), postStartWork);
router.patch("/:id/complete", verifyToken, requireRole("MSLVL"), postMarkCompleted);
router.patch("/:id/verify-close", verifyToken, requireRole("ADMIN"), postVerifyClose);

export default router;