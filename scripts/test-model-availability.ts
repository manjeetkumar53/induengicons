
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

const modelsToTest = [
    "gemini-2.0-flash-lite-preview-02-05",
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-lite-001",
    "gemini-flash-latest",
    "gemini-pro-latest"
];

async function testModels() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        console.error("No API key found in .env.local");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    console.log("Testing models for availability...");

    for (const modelName of modelsToTest) {
        console.log(`\n--- Testing ${modelName} ---`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, strictly reply with 'OK'");
            const response = await result.response;
            console.log(`SUCCESS: ${modelName}`);
            console.log(`Response: ${response.text()}`);
            // If one works, we might just stop or keep going to see all options
        } catch (error: any) {
            console.log(`FAILED: ${modelName}`);
            if (error.message && error.message.includes("429")) {
                console.log("Reason: Quota Exceeded / Rate Limit");
            } else {
                console.log(`Reason: ${error.message}`);
            }
        }
        // Small delay to avoid hammering the API if we aren't rate limited yet
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

testModels();
