import { Router } from "express";

import authRoutes from "./auth.routes";
import complaintRoutes from "./complaint.routes";
import dashboardRoutes from "./dashboard.routes";
import adminRoutes from "./admin.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/complaints", complaintRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/admin", adminRoutes);

export default router;