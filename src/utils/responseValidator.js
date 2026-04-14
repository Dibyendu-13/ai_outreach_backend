const REQUIRED_PATHS = [
  ["businessInsight", "whatTheyLikelyDo"],
  ["businessInsight", "businessModel"],
  ["businessInsight", "probablePainPoints"],
  ["customerIntelligence", "idealCustomerProfile"],
  ["customerIntelligence", "buyingTriggers"],
  ["customerIntelligence", "trustBarriers"],
  ["growthAnalysis", "whyTheyAreNotScaling"],
  ["growthAnalysis", "biggestLeveragePoint"],
  ["marketingOpportunities"],
  ["positioning", "bestAngle"],
  ["positioning", "whyItWorks"],
  ["coldEmail", "subject"],
  ["coldEmail", "body"],
  ["contentIdeas"]
];

export function validateResponseShape(payload) {
  // console.log("[validator] validating response shape");
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    console.log("[validator] invalid payload root");
    return { valid: false, error: "Response is not an object" };
  }

  for (const path of REQUIRED_PATHS) {
    let current = payload;

    for (const key of path) {
      if (current == null || typeof current !== "object" || !(key in current)) {
        console.log("[validator] missing field", path.join("."));
        return { valid: false, error: `Missing required field: ${path.join(".")}` };
      }
      current = current[key];
    }
  }

  return { valid: true };
}
