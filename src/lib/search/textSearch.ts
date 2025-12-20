import { Transaction } from '@/lib/models';

/**
 * Perform text search on transactions using MongoDB text index
 * @param query - Search query string
 * @param filters - Additional filters (date range, type, project, etc.)
 * @param limit - Maximum number of results
 * @returns Array of matching transactions with text score
 */
export async function searchTransactionsText(
    query: string,
    filters: {
        startDate?: Date;
        endDate?: Date;
        type?: 'income' | 'expense';
        projectId?: string;
        categoryId?: string;
    } = {},
    limit: number = 20
) {
    const matchStage: any = {
        $text: { $search: query }
    };

    // Add filters
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

    const results = await Transaction.aggregate([
        { $match: matchStage },
        {
            $addFields: {
                textScore: { $meta: 'textScore' }
            }
        },
        { $sort: { textScore: -1, date: -1 } },
        { $limit: limit }
    ]);

    return results;
}

/**
 * Search with fuzzy matching (for typos)
 * Uses regex for simple fuzzy matching
 */
export async function searchTransactionsFuzzy(
    query: string,
    filters: {
        startDate?: Date;
        endDate?: Date;
        type?: 'income' | 'expense';
    } = {},
    limit: number = 20
) {
    const matchStage: any = {
        $or: [
            { description: { $regex: query, $options: 'i' } },
            { projectName: { $regex: query, $options: 'i' } },
            { categoryName: { $regex: query, $options: 'i' } },
            { source: { $regex: query, $options: 'i' } }
        ]
    };

    if (filters.startDate || filters.endDate) {
        matchStage.date = {};
        if (filters.startDate) matchStage.date.$gte = filters.startDate;
        if (filters.endDate) matchStage.date.$lte = filters.endDate;
    }

    if (filters.type) {
        matchStage.type = filters.type;
    }

    const results = await Transaction.find(matchStage)
        .sort({ date: -1 })
        .limit(limit)
        .lean();

    return results;
}

/**
 * Get search suggestions/autocomplete
 */
export async function getSearchSuggestions(
    query: string,
    field: 'description' | 'projectName' | 'categoryName' | 'source' = 'description',
    limit: number = 5
) {
    const results = await Transaction.aggregate([
        {
            $match: {
                [field]: { $regex: `^${query}`, $options: 'i' }
            }
        },
        {
            $group: {
                _id: `$${field}`,
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: limit }
    ]);

    return results.map(r => r._id);
}
