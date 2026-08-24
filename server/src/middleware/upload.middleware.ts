import { Request, Response, NextFunction } from "express";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// Each pole can carry its own photo, sent as a field named `photo_<poleIndex>`
// (e.g. photo_0, photo_1, ...) — `.any()` accepts however many of those arrive
// without needing to know the pole count up front.
// Wrapped so a bad/oversized upload comes back as normal JSON, not Express's
// default HTML error page.
export function uploadPhotos(req: Request, res: Response, next: NextFunction) {
  upload.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Failed to process an uploaded photo" });
    }
    next();
  });
}
