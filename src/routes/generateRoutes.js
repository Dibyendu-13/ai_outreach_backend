import { Router } from "express";
import { generateReport } from "../controllers/generateController.js";

const router = Router();

console.log("[routes] POST /generate registered");

router.post("/generate", generateReport);

export default router;
