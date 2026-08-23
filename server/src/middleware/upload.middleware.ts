import { Request, Response, NextFunction } from "express";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// Wraps multer so a bad/oversized upload comes back as a normal JSON error
// response instead of Express's default HTML error page.
export function uploadPhoto(req: Request, res: Response, next: NextFunction) {
  upload.single("photo")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Failed to process the uploaded photo" });
    }
    next();
  });
}
