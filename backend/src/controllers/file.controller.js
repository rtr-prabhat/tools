import QRCode from "qrcode";

export const generateQr = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ success: false, message: "Text is required" });
  try {
    const qrDataUrl = await QRCode.toDataURL(text, { width: 400, margin: 2 });
    res.json({ success: true, data: { qrDataUrl } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const base64Encode = (req, res) => {
  const { text, action = "encode" } = req.body;
  if (!text) return res.status(400).json({ success: false, message: "Text is required" });
  try {
    const result = action === "encode"
      ? Buffer.from(text).toString("base64")
      : Buffer.from(text, "base64").toString("utf-8");
    res.json({ success: true, data: { result } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
