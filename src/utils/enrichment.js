function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/p>|<\/h\d>|<\/li>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMeta(html, name) {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["']`, "i")
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return "";
}

export async function enrichBusinessContext({ businessName, website, industry, location, service }) {
  console.log("[enrichment] start", {
    businessName,
    website,
    industry,
    location,
    service
  });

  if (!website) {
    console.log("[enrichment] no website provided, using contextual inference only");
    return {
      source: "inferred",
      businessName: businessName || "",
      website: "",
      title: "",
      description: "",
      signals: [],
      summary: `No website provided. Infer from industry (${industry}), location (${location}), and service (${service}).`
    };
  }

  try {
    console.log("[enrichment] fetching website", website);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(website, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AI Client Acquisition Engine/1.0)"
      }
    });

    clearTimeout(timeout);

    const html = await response.text();
    console.log("[enrichment] website HTML fetched", { bytes: html.length });
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch?.[1]?.trim() || "";
    const description = extractMeta(html, "description") || extractMeta(html, "og:description");
    const h1Matches = [...html.matchAll(/<h1[^>]*>(.*?)<\/h1>/gi)].slice(0, 3);
    const h2Matches = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)].slice(0, 3);
    const bodyText = stripHtml(html).slice(0, 1200);

    const signals = [
      title && `Title: ${title}`,
      description && `Description: ${description}`,
      h1Matches.length && `H1s: ${h1Matches.map((m) => stripHtml(m[1])).join(" | ")}`,
      h2Matches.length && `H2s: ${h2Matches.map((m) => stripHtml(m[1])).join(" | ")}`
    ].filter(Boolean);

    console.log("[enrichment] website fetched successfully");

    return {
      source: "website",
      businessName: businessName || "",
      website,
      title,
      description,
      signals,
      bodyText,
      summary: `Website fetched successfully. Use these signals to ground the analysis in actual positioning, service framing, and trust cues.`
    };
  } catch (error) {
    console.log("[enrichment] website fetch failed", error.message);
    return {
      source: "website_failed",
      businessName: businessName || "",
      website,
      title: "",
      description: "",
      signals: [],
      summary: `Website fetch failed. Fall back to inference using industry (${industry}), location (${location}), and service (${service}).`
    };
  }
}
