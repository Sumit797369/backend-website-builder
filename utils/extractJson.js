import { writeFileSync } from "fs";

const extractJson = (text) => {
  if (!text) {
    console.error("JSON Parse Failed: Input text is undefined or empty");
    return null;
  }

  // Step 1: Try direct JSON.parse first (works when response_format: json_object is used)
  try {
    const parsed = JSON.parse(text);
    if (parsed && parsed.code) {
      console.log("Direct JSON.parse successful!");
      return parsed;
    }
  } catch (_) {
    // Not valid JSON as-is, continue to extraction
  }

  // Step 2: Extract JSON object from surrounding text
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("No JSON found in response");
    }

    const jsonString = text.slice(start, end + 1);
    const parsed = JSON.parse(jsonString);

    if (parsed && parsed.code) {
      console.log("Extracted JSON parse successful!");
      return parsed;
    }

    throw new Error("Parsed JSON missing 'code' field");
  } catch (err) {
    console.error("JSON Parse Failed:", err.message);

    // Step 3: Regex fallback for truncated or poorly escaped JSON
    try {
      console.log("Attempting Regex fallback extraction...");
      let message = "Website generated successfully";
      let code = "";

      const msgMatch = text.match(/"message"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
      if (msgMatch) message = msgMatch[1];

      // Extract everything after "code": " until the last " (or end of string if truncated)
      const codeStartMatch = text.match(/"code"\s*:\s*"/);
      if (codeStartMatch) {
        const startIndex = codeStartMatch.index + codeStartMatch[0].length;
        let codeContent = text.slice(startIndex);
        // Remove trailing "} or "
        codeContent = codeContent.replace(/"\s*}?\s*\]?\s*}?\s*$/, "");
        // Unescape literal \n and \" and \\
        codeContent = codeContent
          .replace(/\\n/g, "\n")
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, "\\");
        code = codeContent;
      }

      if (code) {
        console.log("Regex fallback successful!");
        return { message, code };
      }
    } catch (regexErr) {
      console.error("Regex fallback also failed:", regexErr.message);
    }

    try {
      writeFileSync("failed_response.txt", text);
    } catch (_) {}

    return null;
  }
};

export default extractJson;