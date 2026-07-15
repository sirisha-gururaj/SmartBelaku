import { Router } from "express";
import { verifyToken, requireRole } from "../middleware/auth.middleware";
import { createMslvlAccount, getMslvlAccounts } from "../controllers/admin.controller";

const router = Router();

router.post("/mslvl", verifyToken, requireRole("ADMIN"), createMslvlAccount);
router.get("/mslvl", verifyToken, requireRole("ADMIN"), getMslvlAccounts);

export default router;