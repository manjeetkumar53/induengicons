
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config(); // Fallback to .env

async function listModels() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
        console.error('Error: GOOGLE_GENERATIVE_AI_API_KEY is not set in environment variables.');
        process.exit(1);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // There isn't a direct "listModels" on the main class in some versions, 
        // but we can try to use the model to generate content or check documentation.
        // Actually, for listing models we might need the direct API or check if the SDK exposes it.
        // Let's try a simple fetch to the API endpoint as a fallback if the SDK doesn't make it obvious,
        // but the SDK usually has a ModelManager or similar.

        // Using the raw API for listing models is often more reliable for debugging 404s
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
        }

        const data = await response.json();
        console.log('Available Models:');
        if (data.models) {
            data.models.forEach((model: any) => {
                console.log(`- ${model.name} (Supported methods: ${model.supportedGenerationMethods?.join(', ')})`);
            });
        } else {
            console.log('No models found in response:', data);
        }

    } catch (error) {
        console.error('Error fetching models:', error);
    }
}

listModels();
