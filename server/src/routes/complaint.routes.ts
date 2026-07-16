import { Router } from "express";
import { verifyToken, optionalAuth, requireRole } from "../middleware/auth.middleware";
import {
  fetchComplaints,
  addComplaint,
  trackComplaint,
  assignComplaintToMslvl,
  fetchAssignedComplaints,
  fetchNotifications,
  readNotification,
  readAllNotifications,
  fetchComplaintById,
} from "../controllers/complaint.controller";

const router = Router();

router.get("/", verifyToken, fetchComplaints);
router.post("/", optionalAuth, addComplaint);

router.get("/track/:complaint_number", trackComplaint);
router.get("/mine/assigned", verifyToken, requireRole("MSLVL"), fetchAssignedComplaints);

router.get("/notifications/all", verifyToken, requireRole("ADMIN"), fetchNotifications);
router.patch("/notifications/:id/read", verifyToken, requireRole("ADMIN"), readNotification);
router.patch("/notifications/read-all", verifyToken, requireRole("ADMIN"), readAllNotifications);

router.patch("/:id/assign", verifyToken, requireRole("ADMIN"), assignComplaintToMslvl);
router.get("/:id", verifyToken, requireRole("ADMIN"), fetchComplaintById); // must stay LAST

export default router;