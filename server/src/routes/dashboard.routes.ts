import { Router } from "express";
import { dashboard } from "../controllers/dashboard.controller";
import { verifyToken } from "../middleware/auth.middleware";
const router = Router();

router.get("/", verifyToken, dashboard);

export default router;