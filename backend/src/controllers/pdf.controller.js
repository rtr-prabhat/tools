import { PDFDocument } from "pdf-lib";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const compressPdf = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  try {
    const pdfBuffer = fs.readFileSync(req.file.path);
    const originalSize = pdfBuffer.length;
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();
    const compressedBytes = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false });
    const outputPath = req.file.path.replace(".pdf", "_compressed.pdf");
    fs.writeFileSync(outputPath, compressedBytes);
    const compressedSize = compressedBytes.length;
    const savedPercent = Math.round((1 - compressedSize / originalSize) * 100);

    const targetSizeKB = req.body.targetSizeKB ? parseFloat(req.body.targetSizeKB) : null;
    const targetAchieved = targetSizeKB !== null ? compressedSize <= targetSizeKB * 1024 : null;

    res.json({
      success: true,
      data: {
        originalSize,
        compressedSize,
        pageCount,
        savedPercent,
        targetAchieved,
        downloadUrl: `/api/pdf/download/${path.basename(outputPath)}`,
      },
    });
    fs.unlinkSync(req.file.path);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const mergePdfs = async (req, res) => {
  if (!req.files || req.files.length < 2)
    return res.status(400).json({ success: false, message: "At least 2 PDF files are required" });
  try {
    const mergedDoc = await PDFDocument.create();
    for (const file of req.files) {
      const pdfBuffer = fs.readFileSync(file.path);
      const srcDoc = await PDFDocument.load(pdfBuffer);
      const pages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
      pages.forEach((page) => mergedDoc.addPage(page));
    }
    const mergedBytes = await mergedDoc.save();
    const outputFilename = `${uuidv4()}_merged.pdf`;
    const outputPath = path.join(__dirname, "../../uploads", outputFilename);
    fs.writeFileSync(outputPath, mergedBytes);
    res.json({
      success: true,
      data: {
        pageCount: mergedDoc.getPageCount(),
        downloadUrl: `/api/pdf/download/${outputFilename}`,
      },
    });
    for (const file of req.files) {
      try { fs.unlinkSync(file.path); } catch (_) {}
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const downloadPdf = (req, res) => {
  const filePath = path.join(__dirname, "../../uploads", req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: "File not found" });
  res.download(filePath, () => {
    try { fs.unlinkSync(filePath); } catch (_) {}
  });
};
