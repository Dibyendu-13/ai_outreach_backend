export function mockResponse({ industry, location, service, businessName, website, enrichment }) {
  console.log("[mock] generating fallback response", {
    industry,
    location,
    service,
    businessName,
    website
  });
  const name = businessName || `${industry} business`;
  const contextLine = enrichment?.summary || `Local context inferred from ${location} and ${service}.`;
  console.log("[mock] context prepared", { name, contextLine });
  return {
    businessInsight: {
      whatTheyLikelyDo: `${name} in ${location} offering ${service}.`,
      businessModel: "Local service business focused on inbound leads, trust-building, and conversions.",
      probablePainPoints: [
        "Inconsistent lead flow",
        "Weak differentiation from local competitors",
        "Low conversion from website traffic and inquiries"
      ]
    },
    customerIntelligence: {
      idealCustomerProfile: [
        "Local customers actively searching for the service",
        "Small business owners comparing providers",
        "High-intent prospects ready to book or request a quote"
      ],
      buyingTriggers: [
        "Urgent need",
        "Poor experience with a previous provider",
        "Desire for a faster or more trustworthy solution"
      ],
      trustBarriers: [
        "Lack of reviews or proof",
        "Generic messaging",
        "Unclear pricing or outcomes"
      ]
    },
    growthAnalysis: {
      whyTheyAreNotScaling: [
        "They likely rely too much on referrals or organic interest",
        "Their offer is not framed strongly enough to convert quickly",
        "They do not have a system to follow up on warm leads"
      ],
      biggestLeveragePoint: `A sharper offer plus better conversion-focused messaging on their website and outreach. ${contextLine}`
    },
    marketingOpportunities: [
      "Tighten local SEO around high-intent searches",
      "Improve the landing page above-the-fold offer and proof",
      "Build a follow-up sequence for new leads and quote requests"
    ],
    positioning: {
      bestAngle: `Help ${industry} businesses in ${location} get more qualified leads for ${service} with a conversion-first acquisition system.`,
      whyItWorks: "It connects directly to revenue, speaks to a visible pain point, and is specific enough to feel credible."
    },
    coldEmail: {
      subject: `Quick idea for growing ${industry} leads in ${location}`,
      body: `Hi,\n\nI took a look at ${businessName || `${industry} businesses`} in ${location}, and there are a few places where lead flow and conversion around ${service} could likely be stronger.\n\nI help teams tighten positioning, attract better-fit inquiries, and convert more of the traffic they already have.\n\nIf useful, I can send over a few specific ideas tailored to what I found.\n\nBest,\nYour Name`
    },
    contentIdeas: [
      `How ${industry} businesses in ${location} can attract better leads`,
      `Common ${service} mistakes that reduce conversions`,
      `What a high-converting ${industry} offer looks like`,
      `How to build trust faster with local buyers`
    ]
  };
}
