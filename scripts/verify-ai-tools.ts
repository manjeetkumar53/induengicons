import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local BEFORE importing anything else
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyAiTools() {
    // Dynamic imports to ensure env vars are loaded first
    const { tools } = await import('../src/lib/ai/tools');
    const { default: dbConnect } = await import('../src/lib/mongodb');

    console.log('Connecting to database...');
    await dbConnect();

    console.log('\n--- Verifying getBudgetAnalysis ---');
    try {
        // @ts-ignore
        const budgetAnalysis = await tools.getBudgetAnalysis.execute({});
        console.log('Result:', JSON.stringify(budgetAnalysis, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }

    console.log('\n--- Verifying getCashFlowForecast ---');
    try {
        // @ts-ignore
        const forecast = await tools.getCashFlowForecast.execute({ months: 3 });
        console.log('Result:', JSON.stringify(forecast, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }

    console.log('\n--- Verifying getVendorAnalysis ---');
    try {
        // @ts-ignore
        const vendorAnalysis = await tools.getVendorAnalysis.execute({ limit: 3 });
        console.log('Result:', JSON.stringify(vendorAnalysis, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }

    process.exit(0);
}

verifyAiTools();
