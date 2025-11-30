import { tool } from 'ai';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { Transaction } from '@/lib/models';

/**
 * Simple transaction search tool
 * Uses basic MongoDB text search
 */
export const searchTransactionsTool = tool({
    description: 'Search transactions using natural language. Can search by description, project, category, or vendor.',
    inputSchema: z.object({
        query: z.string().describe('The search query (e.g., "concrete", "Project X", "materials")'),
        limit: z.number().optional().default(10).describe('Maximum number of results to return'),
    }),
    execute: async ({ query, limit = 10 }: { query: string; limit?: number }) => {
        console.log('=== searchTransactionsTool EXECUTED ===');
        console.log('Query:', query, 'Limit:', limit);

        await dbConnect();

        try {
            // Simple MongoDB text search
            const searchTerms = query.split(' ').map(term => term.trim()).filter(Boolean);
            const searchRegex = new RegExp(searchTerms.join('|'), 'i');

            const transactions = await Transaction.find({
                $or: [
                    { description: searchRegex },
                    { projectName: searchRegex },
                    { categoryName: searchRegex },
                    { source: searchRegex },
                    { notes: searchRegex }
                ]
            })
            .sort({ date: -1 })
            .limit(limit)
            .lean();

            console.log('Found transactions:', transactions.length);

            const results = transactions.map((t: any) => ({
                id: t._id.toString(),
                date: t.date.toISOString().split('T')[0],
                description: t.description,
                amount: t.amount,
                type: t.type,
                project: t.projectName || 'N/A',
                category: t.categoryName || 'N/A',
                source: t.source || 'N/A'
            }));

            console.log('searchTransactionsTool result:', { totalFound: results.length });

            return {
                success: true,
                results,
                metadata: {
                    totalFound: results.length,
                    searchType: 'text-search',
                    query
                }
            };
        } catch (error: any) {
            console.error('[SearchTool] Error:', error);
            return {
                success: false,
                error: error.message || 'Search failed',
                results: []
            };
        }
    },
});

/**
 * Advanced search with explicit filters
 */
export const advancedSearchTool = tool({
    description: 'Advanced search with date range and type filters. Use when user specifies exact dates.',
    inputSchema: z.object({
        query: z.string().describe('Search query'),
        startDate: z.string().optional().describe('Start date (YYYY-MM-DD)'),
        endDate: z.string().optional().describe('End date (YYYY-MM-DD)'),
        type: z.string().optional().describe('Transaction type: income or expense'),
        limit: z.number().optional().default(10),
    }),
    execute: async ({ query, startDate, endDate, type, limit = 10 }: { query: string; startDate?: string; endDate?: string; type?: string; limit?: number }) => {
        console.log('=== advancedSearchTool EXECUTED ===');
        console.log('Params:', { query, startDate, endDate, type, limit });

        await dbConnect();

        try {
            const searchQuery: any = {};

            // Text search
            if (query.trim()) {
                const searchRegex = new RegExp(query.split(' ').join('|'), 'i');
                searchQuery.$or = [
                    { description: searchRegex },
                    { projectName: searchRegex },
                    { categoryName: searchRegex },
                    { source: searchRegex }
                ];
            }

            // Date range
            if (startDate || endDate) {
                searchQuery.date = {};
                if (startDate) searchQuery.date.$gte = new Date(startDate);
                if (endDate) searchQuery.date.$lte = new Date(endDate + 'T23:59:59.999Z');
            }

            // Type filter
            if (type === 'income' || type === 'expense') {
                searchQuery.type = type;
            }

            console.log('MongoDB search query:', searchQuery);

            const transactions = await Transaction.find(searchQuery)
                .sort({ date: -1 })
                .limit(limit)
                .lean();

            console.log('Found transactions:', transactions.length);

            const results = transactions.map((t: any) => ({
                id: t._id.toString(),
                date: t.date.toISOString().split('T')[0],
                description: t.description,
                amount: t.amount,
                type: t.type,
                project: t.projectName || 'N/A',
                category: t.categoryName || 'N/A'
            }));

            console.log('advancedSearchTool result:', { totalFound: results.length });

            return {
                success: true,
                results,
                metadata: {
                    totalFound: results.length,
                    searchType: 'filtered-search',
                    filters: { startDate, endDate, type }
                }
            };
        } catch (error: any) {
            console.error('[AdvancedSearchTool] Error:', error);
            return {
                success: false,
                error: error.message,
                results: []
            };
        }
    },
});
