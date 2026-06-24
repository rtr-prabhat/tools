import { Router } from "express";
import upload from "../middleware/upload.js";
import { compressImage, resizeImage, convertImage, imageToPdf, downloadFile, addWatermark } from "../controllers/image.controller.js";

const router = Router();

router.post("/compress", upload.single("file"), compressImage);
router.post("/resize", upload.single("file"), resizeImage);
router.post("/convert", upload.single("file"), convertImage);
router.post("/to-pdf", upload.single("file"), imageToPdf);
router.post("/watermark", upload.single("file"), addWatermark);
router.get("/download/:filename", downloadFile);

export default router;
