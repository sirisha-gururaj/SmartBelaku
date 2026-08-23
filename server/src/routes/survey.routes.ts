import { Router } from "express";
import { verifyToken, requireRole } from "../middleware/auth.middleware";
import { uploadPhoto } from "../middleware/upload.middleware";
import {
  addSurvey,
  fetchMySurveys,
  fetchAllSurveys,
  fetchSurveyById,
  editSurvey,
} from "../controllers/survey.controller";

const router = Router();

router.post("/", verifyToken, requireRole("SURVEYOR"), uploadPhoto, addSurvey);
router.get("/mine", verifyToken, requireRole("SURVEYOR"), fetchMySurveys);
router.get("/", verifyToken, requireRole("ADMIN"), fetchAllSurveys);
router.get("/:id", verifyToken, requireRole("ADMIN", "SURVEYOR"), fetchSurveyById); // must stay LAST
router.patch("/:id", verifyToken, requireRole("ADMIN", "SURVEYOR"), uploadPhoto, editSurvey);

export default router;
