import { Router } from "express";

import authRoutes from "./auth.routes";
import complaintRoutes from "./complaint.routes";
import dashboardRoutes from "./dashboard.routes";
import adminRoutes from "./admin.routes";
import mslvlRoutes from "./mslvl.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/complaints", complaintRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/admin", adminRoutes);
router.use("/mslvl", mslvlRoutes);

export default router;