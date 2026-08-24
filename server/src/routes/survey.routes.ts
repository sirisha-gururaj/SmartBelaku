import { Router } from "express";
import { verifyToken, requireRole } from "../middleware/auth.middleware";
import { uploadPhotos } from "../middleware/upload.middleware";
import {
  addSurvey,
  fetchMySurveys,
  fetchAllSurveys,
  fetchSurveyById,
  editSurvey,
  removeSurvey,
} from "../controllers/survey.controller";

const router = Router();

router.post("/", verifyToken, requireRole("ADMIN", "SURVEYOR"), uploadPhotos, addSurvey);
router.get("/mine", verifyToken, requireRole("SURVEYOR"), fetchMySurveys);
router.get("/", verifyToken, requireRole("ADMIN"), fetchAllSurveys);
router.get("/:id", verifyToken, requireRole("ADMIN", "SURVEYOR"), fetchSurveyById); // must stay LAST
router.patch("/:id", verifyToken, requireRole("ADMIN", "SURVEYOR"), uploadPhotos, editSurvey);
router.delete("/:id", verifyToken, requireRole("ADMIN", "SURVEYOR"), removeSurvey);

export default router;
