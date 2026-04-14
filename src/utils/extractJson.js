export function extractJson(text) {
  console.log("[extractJson] extracting JSON");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    console.log("[extractJson] invalid JSON block");
    throw new Error("Claude did not return valid JSON");
  }

  console.log("[extractJson] JSON bounds", { start, end });
  return text.slice(start, end + 1);
}
