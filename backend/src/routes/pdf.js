import { Router } from "express";
import upload, { uploadMultiple } from "../middleware/upload.js";
import { compressPdf, mergePdfs, downloadPdf } from "../controllers/pdf.controller.js";

const router = Router();

router.post("/compress", upload.single("file"), compressPdf);
router.post("/merge", uploadMultiple.array("files", 10), mergePdfs);
router.get("/download/:filename", downloadPdf);

export default router;
