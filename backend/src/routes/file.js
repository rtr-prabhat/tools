import { Router } from "express";
import { generateQr, base64Encode } from "../controllers/file.controller.js";

const router = Router();

router.post("/qr", generateQr);
router.post("/base64", base64Encode);

export default router;
