import { Router } from "express";
import { verifyToken, requireRole } from "../middleware/auth.middleware";
import {
  createMslvlAccount, getMslvlAccounts, getMslvlAccountDetail,
  createSurveyorAccount, getSurveyorAccounts,
} from "../controllers/admin.controller";

const router = Router();

router.post("/mslvl", verifyToken, requireRole("ADMIN"), createMslvlAccount);
router.get("/mslvl", verifyToken, requireRole("ADMIN"), getMslvlAccounts);
router.get("/mslvl/:id", verifyToken, requireRole("ADMIN"), getMslvlAccountDetail);

router.post("/surveyor", verifyToken, requireRole("ADMIN"), createSurveyorAccount);
router.get("/surveyor", verifyToken, requireRole("ADMIN"), getSurveyorAccounts);

export default router;