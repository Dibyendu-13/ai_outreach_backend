import { Router } from "express";
import { generateReport } from "../controllers/generateController.js";

const router = Router();

console.log("[routes] generate routes initialized");
router.post("/generate", generateReport);

export default router;
