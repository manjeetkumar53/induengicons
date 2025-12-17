import { pipeline, env } from '@xenova/transformers';

// Disable local model loading (use CDN)
env.allowLocalModels = false;

// Singleton pattern for the embedding model
let embedder: unknown = null;

/**
 * Initialize the embedding model
 * Uses all-MiniLM-L6-v2 (384 dimensions, fast, good quality)
 */
async function getEmbedder() {
    if (!embedder) {
        console.log('[Embeddings] Loading model...');
        embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log('[Embeddings] Model loaded successfully');
    }
    return embedder;
}

/**
 * Generate embedding vector for a text string
 * @param text - The text to embed
 * @returns Array of 384 numbers representing the embedding
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
        throw new Error('Text cannot be empty');
    }

    try {
        const model = await getEmbedder();
        const output = await model(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    } catch (error) {
        console.error('[Embeddings] Error generating embedding:', error);
        throw error;
    }
}

/**
 * Generate embedding for a transaction
 * Combines description, project, category, and source for better semantic search
 */
export async function generateTransactionEmbedding(transaction: {
    description: string;
    projectName?: string;
    categoryName?: string;
    source?: string;
}): Promise<number[]> {
    const parts = [
        transaction.description,
        transaction.projectName,
        transaction.categoryName,
        transaction.source
    ].filter(Boolean);

    const combinedText = parts.join(' ');
    return generateEmbedding(combinedText);
}

/**
 * Generate embeddings in batch for better performance
 * @param texts - Array of texts to embed
 * @returns Array of embeddings
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];

    for (const text of texts) {
        if (text && text.trim().length > 0) {
            const embedding = await generateEmbedding(text);
            embeddings.push(embedding);
        } else {
            // Push zero vector for empty texts
            embeddings.push(new Array(384).fill(0));
        }
    }

    return embeddings;
}

/**
 * Calculate cosine similarity between two embeddings
 * @param a - First embedding vector
 * @param b - Second embedding vector
 * @returns Similarity score (0-1, higher is more similar)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
