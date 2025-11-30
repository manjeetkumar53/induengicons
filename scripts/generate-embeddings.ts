#!/usr/bin/env tsx
/**
 * Generate embeddings for existing transactions
 * Run with: npx tsx scripts/generate-embeddings.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Load environment variables - try .env.local first, then .env
const envLocalPath = resolve(process.cwd(), '.env.local');
const envPath = resolve(process.cwd(), '.env');

if (existsSync(envLocalPath)) {
    config({ path: envLocalPath });
} else if (existsSync(envPath)) {
    config({ path: envPath });
} else {
    console.error('No .env or .env.local file found!');
    process.exit(1);
}

import dbConnect from '../src/lib/mongodb';
import { Transaction } from '../src/lib/models';
import { generateTransactionEmbedding } from '../src/lib/search/embeddings';

async function generateEmbeddings() {
    console.log('[Embeddings] Starting embedding generation...');

    try {
        await dbConnect();
        console.log('[Embeddings] Connected to database');

        // Find transactions without embeddings
        const transactions = await Transaction.find({
            $or: [
                { descriptionEmbedding: { $exists: false } },
                { descriptionEmbedding: null },
                { descriptionEmbedding: [] }
            ]
        }).limit(1000); // Process in batches

        console.log(`[Embeddings] Found ${transactions.length} transactions without embeddings`);

        if (transactions.length === 0) {
            console.log('[Embeddings] All transactions already have embeddings!');
            process.exit(0);
        }

        let processed = 0;
        let errors = 0;

        for (const transaction of transactions) {
            try {
                const embedding = await generateTransactionEmbedding({
                    description: transaction.description,
                    projectName: transaction.projectName || undefined,
                    categoryName: transaction.categoryName,
                    source: transaction.source || undefined
                });

                await Transaction.updateOne(
                    { _id: transaction._id },
                    { $set: { descriptionEmbedding: embedding } }
                );

                processed++;

                if (processed % 10 === 0) {
                    console.log(`[Embeddings] Processed ${processed}/${transactions.length}`);
                }
            } catch (error) {
                console.error(`[Embeddings] Error processing transaction ${transaction._id}:`, error);
                errors++;
            }
        }

        console.log(`\n[Embeddings] Complete!`);
        console.log(`  - Processed: ${processed}`);
        console.log(`  - Errors: ${errors}`);
        console.log(`  - Success rate: ${((processed / transactions.length) * 100).toFixed(1)}%`);

    } catch (error) {
        console.error('[Embeddings] Fatal error:', error);
        process.exit(1);
    }

    process.exit(0);
}

generateEmbeddings();
