import { createSalesIntelligenceReport } from "../services/generateService.js";

export async function generateReport(req, res) {
  try {
    const { industry, location, service, businessName, website } = req.body || {};
    console.log("[controller] POST /api/generate", {
      industry,
      location,
      service,
      businessName,
      website
    });

    if (!industry || !location || !service) {
      console.log("[controller] validation failed");
      return res.status(400).json({
        error: "industry, location, and service are required"
      });
    }

    console.log("[controller] validation passed");
    const report = await createSalesIntelligenceReport({
      industry,
      location,
      service,
      businessName,
      website
    });

    console.log("[controller] report generated");
    return res.json(report);
  } catch (error) {
    console.error("[controller] generateReport error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate report"
    });
  }
}
