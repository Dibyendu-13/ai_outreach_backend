import Anthropic from "@anthropic-ai/sdk";
import { mockResponse } from "../utils/mockResponse.js";
import { extractJson } from "../utils/extractJson.js";
import { validateResponseShape } from "../utils/responseValidator.js";
import { enrichBusinessContext } from "../utils/enrichment.js";
import {
  buildBusinessAgentPrompt,
  buildCustomerAgentPrompt,
  buildGrowthAgentPrompt
} from "../utils/agentPrompts.js";
import {
  createBusinessAgent,
  createCustomerAgent,
  createGrowthAgent
} from "./llmAgents.js";

import dotenv from "dotenv";
dotenv.config();

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

console.log("Anthropic key,", process.env.ANTHROPIC_API_KEY ? "found" : "not found");

export async function createSalesIntelligenceReport({ industry, location, service, businessName, website }) {
  console.log("[service] createSalesIntelligenceReport called", {
    industry,
    location,
    service,
    businessName,
    website
  });

  const enrichment = await enrichBusinessContext({
    businessName,
    website,
    industry,
    location,
    service
  });

  console.log("[service] enrichment complete", {
    source: enrichment.source,
    hasSignals: enrichment.signals.length > 0
  });

  if (!anthropic) {
    console.log("[service] no API key found, using mock response");
    return mockResponse({ industry, location, service, businessName, website, enrichment });
  }

  console.log("[service] starting multi-agent workflow");

  const [businessAgent, customerAgent, growthAgent] = await Promise.all([
    createBusinessAgent(
      anthropic,
      {
        industry,
        location,
        service,
        businessName,
        website,
        enrichment
      },
      { buildPrompt: buildBusinessAgentPrompt }
    ),
    createCustomerAgent(
      anthropic,
      {
        industry,
        location,
        service,
        businessName,
        website,
        enrichment
      },
      { buildPrompt: buildCustomerAgentPrompt }
    ),
    createGrowthAgent(
      anthropic,
      {
        industry,
        location,
        service,
        businessName,
        website,
        enrichment
      },
      { buildPrompt: buildGrowthAgentPrompt }
    )
  ]);

  const [businessResult, customerResult, growthResult] = await Promise.all([
    parseAgentResponse(businessAgent),
    parseAgentResponse(customerAgent),
    parseAgentResponse(growthAgent)
  ]);

  console.log("[service] agent outputs parsed", {
    businessValid: Object.keys(businessResult || {}).length > 0,
    customerValid: Object.keys(customerResult || {}).length > 0,
    growthValid: Object.keys(growthResult || {}).length > 0
  });

  const report = mergeAgentResults({
    industry,
    location,
    service,
    businessName,
    website,
    enrichment,
    businessResult,
    customerResult,
    growthResult
  });

  const validation = validateResponseShape(report);
  console.log("[service] validation result", validation);

  if (validation.valid) {
    console.log("[service] multi-agent response validated");
    return report;
  }

  console.log("[service] validation failed, using mock response", validation.error);
  return mockResponse({ industry, location, service, businessName, website, enrichment });
}

function mergeAgentResults({
  industry,
  location,
  service,
  businessName,
  website,
  enrichment,
  businessResult,
  customerResult,
  growthResult
}) {
  console.log("[service] merging agent outputs in code");

  return {
    businessInsight: {
      whatTheyLikelyDo:
        businessResult?.whatTheyLikelyDo ||
        `${businessName || `${industry} business`} in ${location} offering ${service}.`,
      businessModel:
        businessResult?.businessModel ||
        "Local service business focused on inbound leads, trust-building, and conversions.",
      probablePainPoints: businessResult?.probablePainPoints || []
    },
    customerIntelligence: {
      idealCustomerProfile: customerResult?.idealCustomerProfile || [],
      buyingTriggers: customerResult?.buyingTriggers || [],
      trustBarriers: customerResult?.trustBarriers || []
    },
    growthAnalysis: {
      whyTheyAreNotScaling: growthResult?.whyTheyAreNotScaling || [],
      biggestLeveragePoint: growthResult?.biggestLeveragePoint || ""
    },
    marketingOpportunities:
      growthResult?.marketingOpportunities || defaultMarketingOpportunities({ industry, location, service }),
    positioning: buildPositioning({ industry, location, service, businessName, enrichment, businessResult, growthResult }),
    coldEmail: buildColdEmail({ industry, location, service, businessName, growthResult }),
    contentIdeas: buildContentIdeas({ industry, location, service, businessName, businessResult, growthResult })
  };
}

function buildPositioning({ industry, location, service, businessName, enrichment, businessResult, growthResult }) {
  const name = businessName || `${industry} business`;
  const signal = enrichment?.title || enrichment?.description || "local market signal";
  return {
    bestAngle: `Help ${name} in ${location} get more qualified leads for ${service} with a conversion-first acquisition system.`,
    whyItWorks: `It ties directly to revenue, is specific to the market, and is grounded in the site's signal: ${signal}.`
  };
}

function buildColdEmail({ industry, location, service, businessName, growthResult }) {
  const name = businessName || `${industry} business`;
  return {
    subject: `Quick idea for growing ${name} leads in ${location}`,
    body: `Hi,\n\nI reviewed ${name} in ${location} and saw a few opportunities to improve lead flow and conversion around ${service}.\n\nI help teams tighten positioning, attract better-fit inquiries, and convert more of the traffic they already have.\n\nIf useful, I can send over a few specific ideas tailored to what I found.\n\nBest,\nYour Name`
  };
}

function buildContentIdeas({ industry, location, service, businessName, businessResult, growthResult }) {
  const name = businessName || `${industry} business`;
  return [
    `How ${name} in ${location} can get better leads`,
    `Why ${service} pages fail to convert in local markets`,
    `What a high-converting ${industry} offer looks like`,
    `How to build trust faster with local buyers`
  ];
}

function defaultMarketingOpportunities({ industry, location, service }) {
  return [
    `Tighten local SEO around ${location} intent searches`,
    `Improve the offer and proof above the fold`,
    `Add a stronger follow-up sequence for new leads`
  ];
}

async function parseAgentResponse(response) {
  console.log("[service] parsing agent response");
  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  try {
    const json = extractJson(text);
    console.log("[service] JSON block extracted");
    return JSON.parse(json);
  } catch (error) {
    console.log("[service] parse failed, returning empty object", error.message);
    return {};
  }
}
