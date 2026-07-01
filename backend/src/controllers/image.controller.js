import sharp from "sharp";
import path from "path";
import fs from "fs";
import { PDFDocument } from "pdf-lib";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const compressImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  const { quality = 75 } = req.body;
  const outputPath = req.file.path.replace(path.extname(req.file.path), "_compressed.jpg");
  try {
    await sharp(req.file.path).jpeg({ quality: parseInt(quality) }).toFile(outputPath);
    const originalSize = fs.statSync(req.file.path).size;
    const compressedSize = fs.statSync(outputPath).size;
    res.json({
      success: true,
      data: {
        originalSize,
        compressedSize,
        savedPercent: Math.round((1 - compressedSize / originalSize) * 100),
        downloadUrl: `/api/image/download/${path.basename(outputPath)}`,
      },
    });
    fs.unlinkSync(req.file.path);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const resizeImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  const { width, height } = req.body;
  if (!width && !height) return res.status(400).json({ success: false, message: "Width or height required" });
  const outputPath = req.file.path.replace(path.extname(req.file.path), "_resized" + path.extname(req.file.path));
  try {
    await sharp(req.file.path)
      .resize(width ? parseInt(width) : null, height ? parseInt(height) : null, { fit: "inside" })
      .toFile(outputPath);
    res.json({
      success: true,
      data: { downloadUrl: `/api/image/download/${path.basename(outputPath)}` },
    });
    fs.unlinkSync(req.file.path);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const convertImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  const { format = "webp" } = req.body;
  const allowedFormats = ["jpeg", "png", "webp", "avif"];
  if (!allowedFormats.includes(format))
    return res.status(400).json({ success: false, message: "Invalid format. Use: jpeg, png, webp, avif" });
  const outputPath = req.file.path.replace(path.extname(req.file.path), `_converted.${format}`);
  try {
    await sharp(req.file.path).toFormat(format).toFile(outputPath);
    res.json({
      success: true,
      data: { downloadUrl: `/api/image/download/${path.basename(outputPath)}`, format },
    });
    fs.unlinkSync(req.file.path);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const imageToPdf = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  try {
    const imgBuffer = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.create();
    const ext = path.extname(req.file.originalname).toLowerCase();
    const img = ext === ".png" ? await pdfDoc.embedPng(imgBuffer) : await pdfDoc.embedJpg(imgBuffer);
    const page = pdfDoc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    const pdfBytes = await pdfDoc.save();
    const outputPath = req.file.path.replace(path.extname(req.file.path), ".pdf");
    fs.writeFileSync(outputPath, pdfBytes);
    res.json({
      success: true,
      data: { downloadUrl: `/api/image/download/${path.basename(outputPath)}` },
    });
    fs.unlinkSync(req.file.path);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const downloadFile = (req, res) => {
  if (!/^[a-zA-Z0-9_.-]+$/.test(req.params.filename)) {
    return res.status(400).json({ success: false, message: "Invalid filename" });
  }
  const filePath = path.join(__dirname, "../../uploads", req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: "File not found" });
  res.download(filePath, () => {
    try { fs.unlinkSync(filePath); } catch (_) {}
  });
};

export const addWatermark = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  const { text = "WATERMARK", opacity = "0.3", fontSize = "48", position = "center", color = "white" } = req.body;
  try {
    const { width, height } = await sharp(req.file.path).metadata();
    const op = Math.min(1, Math.max(0, parseFloat(opacity)));
    const fs2 = Math.min(200, Math.max(12, parseInt(fontSize)));
    const fillColor = color === "black" ? `rgba(0,0,0,${op})` : `rgba(255,255,255,${op})`;
    const svgText = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial, sans-serif" font-size="${fs2}px" fill="${fillColor}"
        transform="rotate(-35, ${Math.round(width/2)}, ${Math.round(height/2)})"
        style="letter-spacing:4px">${text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>
    </svg>`;
    const outputPath = req.file.path.replace(path.extname(req.file.path), "_watermarked.jpg");
    await sharp(req.file.path)
      .composite([{ input: Buffer.from(svgText), blend: "over" }])
      .jpeg({ quality: 90 })
      .toFile(outputPath);
    res.json({ success: true, data: { downloadUrl: `/api/image/download/${path.basename(outputPath)}` } });
    fs.unlinkSync(req.file.path);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
