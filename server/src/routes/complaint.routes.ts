import { Router } from "express";
import { verifyToken, optionalAuth, requireRole } from "../middleware/auth.middleware";
import {
  fetchComplaints,
  addComplaint,
  trackComplaint,
  assignComplaintToMslvl,
  fetchAssignedComplaints,
} from "../controllers/complaint.controller";

const router = Router();

router.get("/", verifyToken, fetchComplaints);
router.post("/", optionalAuth, addComplaint);
router.get("/track/:complaint_number", trackComplaint);
router.get("/mine/assigned", verifyToken, requireRole("MSLVL"), fetchAssignedComplaints);
router.patch("/:id/assign", verifyToken, requireRole("ADMIN"), assignComplaintToMslvl);

export default router;