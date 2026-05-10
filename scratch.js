import dotenv from "dotenv";
dotenv.config();
import generateResponse from "./config/openRouter.js";
import extractJson from "./utils/extractJson.js";

async function test() {
  try {
    console.log("Fetching from open router...");
    const raw = await generateResponse("Hi, return a JSON with { \"message\": \"test\", \"files\": [] }");
    console.log("Raw response:", raw);
    const parsed = await extractJson(raw);
    console.log("Parsed JSON:", parsed);
  } catch (error) {
    console.error("Test Error:", error);
  }
}

test();
