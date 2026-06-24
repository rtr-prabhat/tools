import { Router } from "express";
import toolsCatalog from "../data/tools.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ success: true, data: toolsCatalog });
});

router.get("/category/:categoryId", (req, res) => {
  const category = toolsCatalog.find((c) => c.id === req.params.categoryId);
  if (!category) return res.status(404).json({ success: false, message: "Category not found" });
  res.json({ success: true, data: category });
});

router.get("/tool/:toolId", (req, res) => {
  for (const category of toolsCatalog) {
    const tool = category.tools.find((t) => t.id === req.params.toolId);
    if (tool) return res.json({ success: true, data: { ...tool, category: category.name } });
  }
  res.status(404).json({ success: false, message: "Tool not found" });
});

export default router;
