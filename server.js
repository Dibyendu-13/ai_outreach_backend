import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;



// ✅ Fallback response (used when Claude fails)
function mockResponse({ industry, location, service }) {
  return {
    businessInsight: {
      whatTheyLikelyDo: `A ${industry || "business"} in ${location || "your area"} likely selling ${service || "services"}.`,
      probablePainPoints: [
        "Inconsistent lead flow",
        "Weak online visibility",
        "Low conversion from inquiries"
      ]
    },
    marketingOpportunities: [
      "Improve local SEO",
      "Clarify the value proposition",
      "Build a better follow-up system"
    ],
    coldEmail: {
      subject: `Quick idea for your business`,
      body: `Hi,\n\nI had a few ideas to improve your lead generation.\n\nHappy to share if you're interested.\n\nBest,`
    },
    contentIdeas: [
      "How to get more leads",
      "Common marketing mistakes",
      "Improving conversions",
      "Simple growth strategies"
    ]
  };
}

// ✅ Extract JSON safely from Claude response
function extractJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Claude did not return valid JSON");
  }

  return text.slice(start, end + 1);
}

app.post("/api/generate", async (req, res) => {
  const { industry, location, service } = req.body || {};
  console.log("POST /api/generate", { industry, location, service });

  try {
    // ✅ Validation
    if (!industry || !location || !service) {
      return res.status(400).json({
        error: "industry, location, and service are required"
      });
    }

    const prompt = `Generate a JSON object only with this structure:
{
  "businessInsight": {
    "whatTheyLikelyDo": "string",
    "probablePainPoints": ["string", "string", "string"]
  },
  "marketingOpportunities": ["string", "string", "string"],
  "coldEmail": {
    "subject": "string",
    "body": "string"
  },
  "contentIdeas": ["string", "string", "string", "string"]
}

Business details:
- Industry: ${industry}
- Location: ${location}
- Service: ${service}

Make it specific, concise, and conversion-focused. Do not use markdown fences.`;

    // ✅ If no API key → fallback
    if (!anthropic) {
      console.log("No API key → using mock");
      return res.json(mockResponse({ industry, location, service }));
    }

    // ✅ Add timeout protection
    const response = await Promise.race([
      anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 800,
        temperature: 0.2,
        system: "You are a precise JSON generator. Return only valid JSON.",
        messages: [{ role: "user", content: prompt }]
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Claude timeout")), 30000)
      )
    ]);

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    // ✅ Extract + parse safely
    let parsed;
    try {
      const json = extractJson(text);
      parsed = JSON.parse(json);
    } catch (err) {
      console.error("JSON parsing failed:", text);
      return res.json(mockResponse({ industry, location, service }));
    }

    console.log("✅ Claude success");
    return res.json(parsed);

  } catch (error) {
    console.error("❌ ERROR:", error.message);

    // ✅ NEVER crash → always return something
    return res.json(mockResponse({ industry, location, service }));
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});