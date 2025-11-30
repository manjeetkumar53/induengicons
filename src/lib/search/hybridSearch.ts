import { Transaction } from '@/lib/models';
import { generateEmbedding } from './embeddings';
import { searchTransactionsText } from './textSearch';

/**
 * Hybrid search combining vector search (semantic) and text search (keywords)
 * @param query - User's search query
 * @param filters - Date range, type, project filters
 * @param options - Search options (weights, limits)
 * @returns Combined and ranked results
 */
export async function hybridSearch(
    query: string,
    filters: {
        startDate?: Date;
        endDate?: Date;
        type?: 'income' | 'expense';
        projectId?: string;
        categoryId?: string;
    } = {},
    options: {
        vectorWeight?: number; // 0-1, default 0.4
        textWeight?: number; // 0-1, default 0.6
        limit?: number; // default 20
    } = {}
) {
    const {
        vectorWeight = 0.4,
        textWeight = 0.6,
        limit = 20
    } = options;

    try {
        // 1. Generate embedding for the query
        const queryEmbedding = await generateEmbedding(query);

        // 2. Build match stage for filters
        const matchStage: any = {};

        if (filters.startDate || filters.endDate) {
            matchStage.date = {};
            if (filters.startDate) matchStage.date.$gte = filters.startDate;
            if (filters.endDate) matchStage.date.$lte = filters.endDate;
        }

        if (filters.type) {
            matchStage.type = filters.type;
        }

        if (filters.projectId) {
            matchStage.projectId = filters.projectId;
        }

        if (filters.categoryId) {
            matchStage.categoryId = filters.categoryId;
        }

        // 3. Perform vector search
        const vectorResults = await Transaction.aggregate([
            {
                $vectorSearch: {
                    index: 'transaction_vector_search',
                    path: 'descriptionEmbedding',
                    queryVector: queryEmbedding,
                    numCandidates: 100,
                    limit: limit * 2 // Get more candidates for merging
                }
            },
            ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
            {
                $addFields: {
                    vectorScore: { $meta: 'vectorSearchScore' }
                }
            },
            { $limit: limit }
        ]);

        // 4. Perform text search (fallback if vector search fails or for keyword matching)
        let textResults: any[] = [];
        try {
            textResults = await searchTransactionsText(query, filters, limit);
        } catch (error) {
            console.warn('[HybridSearch] Text search failed, using vector only:', error);
        }

        // 5. Merge and rank results
        const resultsMap = new Map();

        // Add vector results
        vectorResults.forEach((result: any) => {
            const id = result._id.toString();
            resultsMap.set(id, {
                ...result,
                vectorScore: result.vectorScore || 0,
                textScore: 0,
                hybridScore: (result.vectorScore || 0) * vectorWeight
            });
        });

        // Add/merge text results
        textResults.forEach((result: any) => {
            const id = result._id.toString();
            const existing = resultsMap.get(id);

            if (existing) {
                // Merge scores
                existing.textScore = result.textScore || 0;
                existing.hybridScore =
                    (existing.vectorScore * vectorWeight) +
                    (result.textScore * textWeight);
            } else {
                // Add new result
                resultsMap.set(id, {
                    ...result,
                    vectorScore: 0,
                    textScore: result.textScore || 0,
                    hybridScore: (result.textScore || 0) * textWeight
                });
            }
        });

        // 6. Sort by hybrid score and return top results
        const finalResults = Array.from(resultsMap.values())
            .sort((a, b) => b.hybridScore - a.hybridScore)
            .slice(0, limit);

        return {
            results: finalResults,
            metadata: {
                totalResults: finalResults.length,
                vectorResults: vectorResults.length,
                textResults: textResults.length,
                weights: { vectorWeight, textWeight }
            }
        };

    } catch (error) {
        console.error('[HybridSearch] Error:', error);

        // Fallback to text search only
        console.log('[HybridSearch] Falling back to text search only');
        const textResults = await searchTransactionsText(query, filters, limit);

        return {
            results: textResults.map(r => ({
                ...r,
                vectorScore: 0,
                textScore: r.textScore || 0,
                hybridScore: r.textScore || 0
            })),
            metadata: {
                totalResults: textResults.length,
                vectorResults: 0,
                textResults: textResults.length,
                weights: { vectorWeight: 0, textWeight: 1 },
                fallback: true
            }
        };
    }
}

/**
 * Search with automatic query understanding
 * Extracts entities and filters from natural language
 */
export async function smartSearch(query: string, limit: number = 20) {
    // Extract date mentions
    const datePatterns = {
        'last month': () => {
            const now = new Date();
            return {
                startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
                endDate: new Date(now.getFullYear(), now.getMonth(), 0)
            };
        },
        'this month': () => {
            const now = new Date();
            return {
                startDate: new Date(now.getFullYear(), now.getMonth(), 1),
                endDate: now
            };
        },
        'last year': () => {
            const now = new Date();
            return {
                startDate: new Date(now.getFullYear() - 1, 0, 1),
                endDate: new Date(now.getFullYear() - 1, 11, 31)
            };
        }
    };

    let filters: any = {};
    let cleanQuery = query.toLowerCase();

    // Extract date range
    for (const [pattern, getRange] of Object.entries(datePatterns)) {
        if (cleanQuery.includes(pattern)) {
            const range = getRange();
            filters = { ...filters, ...range };
            cleanQuery = cleanQuery.replace(pattern, '').trim();
            break;
        }
    }

    // Extract type (income/expense)
    if (cleanQuery.includes('income') || cleanQuery.includes('revenue')) {
        filters.type = 'income';
        cleanQuery = cleanQuery.replace(/income|revenue/g, '').trim();
    } else if (cleanQuery.includes('expense') || cleanQuery.includes('spending')) {
        filters.type = 'expense';
        cleanQuery = cleanQuery.replace(/expense|spending/g, '').trim();
    }

    // Perform hybrid search with extracted filters
    return hybridSearch(cleanQuery || query, filters, { limit });
}
