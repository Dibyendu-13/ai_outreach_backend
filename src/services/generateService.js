import Anthropic from "@anthropic-ai/sdk";
import { mockResponse } from "../utils/mockResponse.js";
import { extractJson } from "../utils/extractJson.js";
import { validateResponseShape } from "../utils/responseValidator.js";
import { enrichBusinessContext } from "../utils/enrichment.js";
import {
  buildBusinessAgentPrompt,
  buildCustomerAgentPrompt,
  buildGrowthAgentPrompt,
  buildSynthesisPrompt
} from "../utils/agentPrompts.js";
import {
  createBusinessAgent,
  createCustomerAgent,
  createGrowthAgent,
  createSynthesisAgent
} from "./llmAgents.js";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

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

  const [business, customer, growth] = await Promise.all([
    createBusinessAgent(anthropic, {
      industry,
      location,
      service,
      businessName,
      website,
      enrichment,
      buildPrompt: buildBusinessAgentPrompt
    }),
    createCustomerAgent(anthropic, {
      industry,
      location,
      service,
      businessName,
      website,
      enrichment,
      buildPrompt: buildCustomerAgentPrompt
    }),
    createGrowthAgent(anthropic, {
      industry,
      location,
      service,
      businessName,
      website,
      enrichment,
      buildPrompt: buildGrowthAgentPrompt
    })
  ]);

  const synthesis = await createSynthesisAgent(anthropic, {
    industry,
    location,
    service,
    businessName,
    website,
    business,
    customer,
    growth,
    enrichment,
    buildPrompt: buildSynthesisPrompt
  });

  const parsed = parseAgentResponse(synthesis, { industry, location, service, businessName, website, enrichment });
  const validation = validateResponseShape(parsed);
  console.log("[service] validation result", validation);

  if (validation.valid) {
    console.log("[service] multi-agent response validated");
    return parsed;
  }

  console.log("[service] validation failed, using repair pass", validation.error);
  const repair = await createSynthesisAgent(anthropic, {
    industry,
    location,
    service,
    businessName,
    website,
    business,
    customer,
    growth,
    enrichment,
    buildPrompt: buildSynthesisPrompt,
    repairError: validation.error,
    previousOutput: parsed
  });

  const repaired = parseAgentResponse(repair, { industry, location, service, businessName, website, enrichment });
  const repairedValidation = validateResponseShape(repaired);
  console.log("[service] repair validation result", repairedValidation);

  if (repairedValidation.valid) {
    console.log("[service] repair pass validated");
    return repaired;
  }

  console.log("[service] repair pass failed, using mock response", repairedValidation.error);
  return mockResponse({ industry, location, service, businessName, website, enrichment });
}

function parseAgentResponse(response, fallbackContext) {
  console.log("[service] parsing agent response");
  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  console.log("[service] Claude response received");

  try {
    const json = extractJson(text);
    console.log("[service] JSON block extracted");
    return JSON.parse(json);
  } catch (error) {
    console.log("[service] parse failed, returning mock response", error.message);
    return mockResponse(fallbackContext);
  }
}
