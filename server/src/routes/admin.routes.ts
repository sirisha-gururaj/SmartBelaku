import { Router } from "express";
import { verifyToken, requireRole } from "../middleware/auth.middleware";
import { createMslvlAccount, getMslvlAccounts, getMslvlAccountDetail } from "../controllers/admin.controller";

const router = Router();

router.post("/mslvl", verifyToken, requireRole("ADMIN"), createMslvlAccount);
router.get("/mslvl", verifyToken, requireRole("ADMIN"), getMslvlAccounts);
router.get("/mslvl/:id", verifyToken, requireRole("ADMIN"), getMslvlAccountDetail);
export default router;