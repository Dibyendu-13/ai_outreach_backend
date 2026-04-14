import { Router } from "express";
import { generateReport } from "../controllers/generateController.js";

const router = Router();


router.post("/generate", generateReport);

export default router;
