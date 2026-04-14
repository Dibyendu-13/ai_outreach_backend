import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import generateRoutes from "./src/routes/generateRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// console.log("[server] booting backend");
// console.log("[server] env loaded", {
//   port,
//   hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY)
// });

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  console.log("[server] GET /health");
  res.json({ ok: true });
});

app.use("/api", generateRoutes);

app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`);
});
