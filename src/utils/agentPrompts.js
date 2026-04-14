export function buildBusinessAgentPrompt({ industry, location, service, businessName, website, enrichment }) {
  console.log("[prompt:business] building prompt");
  return `Return JSON only with:
{
  "whatTheyLikelyDo": "",
  "businessModel": "",
  "probablePainPoints": []
}

Business context:
Industry: ${industry}
Location: ${location}
Service: ${service}
Business name: ${businessName || "unknown"}
Website: ${website || "none"}
Enrichment summary: ${enrichment?.summary || "none"}
Enrichment signals: ${JSON.stringify(enrichment?.signals || [])}

Make it specific and realistic.`;
}

export function buildCustomerAgentPrompt({ industry, location, service, businessName, website, enrichment }) {
  console.log("[prompt:customer] building prompt");
  return `Return JSON only. No markdown. No explanation.

Schema:
{
  "idealCustomerProfile": [],
  "buyingTriggers": [],
  "trustBarriers": []
}

Business context:
Industry: ${industry}
Location: ${location}
Service: ${service}
Business name: ${businessName || "unknown"}
Website: ${website || "none"}
Enrichment summary: ${enrichment?.summary || "none"}
Enrichment signals: ${JSON.stringify(enrichment?.signals || [])}

Rules:
- Use short bullet-like strings in arrays
- Keep each item specific to this business
- Return only valid JSON`;
}

export function buildGrowthAgentPrompt({ industry, location, service, businessName, website, enrichment }) {
  console.log("[prompt:growth] building prompt");
  return `Return JSON only. No markdown. No explanation.

Schema:
{
  "whyTheyAreNotScaling": [],
  "biggestLeveragePoint": "",
  "marketingOpportunities": []
}

Business context:
Industry: ${industry}
Location: ${location}
Service: ${service}
Business name: ${businessName || "unknown"}
Website: ${website || "none"}
Enrichment summary: ${enrichment?.summary || "none"}
Enrichment signals: ${JSON.stringify(enrichment?.signals || [])}

Rules:
- Keep the output short and concrete
- Avoid filler or generic marketing advice
- Return only valid JSON`;
}

export function buildSynthesisPrompt({
  industry,
  location,
  service,
  businessName,
  website,
  enrichment,
  business,
  customer,
  growth,
  repairError,
  previousOutput
}) {
  console.log("[prompt:synthesis] building prompt");
  return `You are the synthesis agent for a multi-agent sales intelligence system.

Combine the following agent outputs into the final schema below.

Return a single valid JSON object only.
Do not wrap the JSON in markdown fences.
Do not add commentary, bullets, or code blocks.
Make every string value plain text with no trailing commas.
If a field is unknown, infer the best realistic answer from the evidence.

Business agent output:
${JSON.stringify(business)}

Customer agent output:
${JSON.stringify(customer)}

Growth agent output:
${JSON.stringify(growth)}

Business name: ${businessName || "unknown"}
Website: ${website || "none"}
Enrichment summary: ${enrichment?.summary || "none"}
Enrichment signals: ${JSON.stringify(enrichment?.signals || [])}

${repairError ? `Previous error: ${repairError}` : ""}
${previousOutput ? `Previous output: ${JSON.stringify(previousOutput)}` : ""}

FINAL SCHEMA:
{
  "businessInsight": {
    "whatTheyLikelyDo": "",
    "businessModel": "",
    "probablePainPoints": []
  },
  "customerIntelligence": {
    "idealCustomerProfile": [],
    "buyingTriggers": [],
    "trustBarriers": []
  },
  "growthAnalysis": {
    "whyTheyAreNotScaling": [],
    "biggestLeveragePoint": ""
  },
  "marketingOpportunities": [],
  "positioning": {
    "bestAngle": "",
    "whyItWorks": ""
  },
  "coldEmail": {
    "subject": "",
    "body": ""
  },
  "contentIdeas": []
}

Return only valid JSON.`;
}

export function buildSynthesisRepairPrompt({ brokenText, errorMessage }) {
  return `You are repairing malformed JSON.

Fix the JSON so it is strictly valid and matches the final schema exactly.
Do not add any new commentary.
Do not wrap the output in markdown fences.

Parsing error:
${errorMessage}

Malformed output:
${brokenText}

Return only valid JSON.`;
}
