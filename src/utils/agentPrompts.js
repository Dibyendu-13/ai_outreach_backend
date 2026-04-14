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
  return `Return JSON only with:
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

Make it specific and realistic.`;
}

export function buildGrowthAgentPrompt({ industry, location, service, businessName, website, enrichment }) {
  console.log("[prompt:growth] building prompt");
  return `Return JSON only with:
{
  "whyTheyAreNotScaling": [],
  "biggestLeveragePoint": "",
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
