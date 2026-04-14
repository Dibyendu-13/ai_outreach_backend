export async function createBusinessAgent(anthropic, context, { buildPrompt }) {
  console.log("[agent:business] building prompt");
  console.log("[agent:business] context", {
    industry: context.industry,
    location: context.location,
    service: context.service
  });
  return anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    temperature: 0.2,
    system: "You are the business reconstruction agent. Return only valid JSON.",
    messages: [
      {
        role: "user",
        content: buildPrompt(context)
      }
    ]
  });
}

export async function createCustomerAgent(anthropic, context, { buildPrompt }) {
  console.log("[agent:customer] building prompt");
  console.log("[agent:customer] context", {
    industry: context.industry,
    location: context.location,
    service: context.service
  });
  return anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    temperature: 0.2,
    system: "You are the customer intelligence agent. Return only valid JSON.",
    messages: [
      {
        role: "user",
        content: buildPrompt(context)
      }
    ]
  });
}

export async function createGrowthAgent(anthropic, context, { buildPrompt }) {
  console.log("[agent:growth] building prompt");
  console.log("[agent:growth] context", {
    industry: context.industry,
    location: context.location,
    service: context.service
  });
  return anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 700,
    temperature: 0.2,
    system: "You are the growth strategist agent. Return only valid JSON.",
    messages: [
      {
        role: "user",
        content: buildPrompt(context)
      }
    ]
  });
}

export async function createSynthesisAgent(
  anthropic,
  {
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
  },
  { buildPrompt }
) {
  // console.log("[agent:synthesis] building prompt");
  // console.log("[agent:synthesis] inputs", {
  //   industry,
  //   location,
  //   service,
  //   hasBusiness: Boolean(business),
  //   hasCustomer: Boolean(customer),
  //   hasGrowth: Boolean(growth),
  //   hasEnrichment: Boolean(enrichment)
  // });

  const prompt = buildPrompt({
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
  });

  return anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    temperature: 0.2,
    system:
      "You are the synthesis agent. Merge the agent outputs into the exact final schema and return only valid JSON.",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });
}
