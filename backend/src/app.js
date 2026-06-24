import express from "express";
import cors from "cors";
import { config } from "dotenv";
import toolsRouter from "./routes/tools.js";
import imageRouter from "./routes/image.js";
import pdfRouter from "./routes/pdf.js";
import fileRouter from "./routes/file.js";

config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || origin.startsWith("http://localhost:") || origin === (process.env.FRONTEND_URL || "http://localhost:3000")) {
      cb(null, true);
    } else {
      cb(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/tools", toolsRouter);
app.use("/api/image", imageRouter);
app.use("/api/pdf", pdfRouter);
app.use("/api/file", fileRouter);

app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || "Internal server error" });
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
