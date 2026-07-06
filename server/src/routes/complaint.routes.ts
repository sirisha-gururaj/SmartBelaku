import { Router } from "express";

import {
  fetchComplaints,
  addComplaint,
} from "../controllers/complaint.controller";

const router = Router();

router.get("/", fetchComplaints);

router.post("/", addComplaint);

export default router;