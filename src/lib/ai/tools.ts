import { tool } from 'ai';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { Transaction, Project, TransactionCategory, ExpenseCategory } from '@/lib/models';
import mongoose from 'mongoose';
import { searchTransactionsTool, advancedSearchTool } from './searchTools';

// Helper to get date range
const getDateRange = (period: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (period) {
        case 'this_month':
            return {
                start: new Date(now.getFullYear(), now.getMonth(), 1),
                end: now
            };
        case 'last_month':
            return {
                start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
                end: new Date(now.getFullYear(), now.getMonth(), 0)
            };
        case 'this_year':
            return {
                start: new Date(now.getFullYear(), 0, 1),
                end: now
            };
        case 'last_30_days':
            return {
                start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
                end: now
            };
        default:
            return {
                start: new Date(now.getFullYear(), now.getMonth(), 1),
                end: now
            };
    }
};

export const tools = {
    // Search tools
    searchTransactions: searchTransactionsTool,
    advancedSearch: advancedSearchTool,

    // Core financial tools
    getProfitLoss: tool({
        description: 'Get profit and loss summary (income, expenses, net profit) for a specific period.',
        inputSchema: z.object({
            period: z.string().describe('The time period to analyze (this_month, last_month, this_year, last_30_days)'),
        }),
        execute: async ({ period }: { period: string }) => {
            console.log('=== getProfitLoss EXECUTED ===');
            console.log('Period requested:', period);
            
            await dbConnect();
            const { start, end } = getDateRange(period);

            console.log('Date range:', { start, end });

            const transactions = await Transaction.find({
                date: { $gte: start, $lte: end }
            });

            console.log('Found transactions:', transactions.length);

            const income = transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const expenses = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            const result = {
                period,
                income,
                expenses,
                netProfit: income - expenses,
                margin: income > 0 ? ((income - expenses) / income) * 100 : 0
            };

            console.log('getProfitLoss result:', result);
            return result;
        },
    }),

    getTopExpenses: tool({
        description: 'Get the top expense categories for a specific period.',
        inputSchema: z.object({
            period: z.string().describe('The time period to analyze'),
            limit: z.number().optional().default(5).describe('Number of categories to return'),
        }),
        execute: async ({ period, limit = 5 }: { period: string; limit?: number }) => {
            await dbConnect();
            const { start, end } = getDateRange(period);

            const expenses = await Transaction.aggregate([
                {
                    $match: {
                        type: 'expense',
                        date: { $gte: start, $lte: end }
                    }
                },
                {
                    $group: {
                        _id: '$expenseCategoryName',
                        total: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { total: -1 } },
                { $limit: limit }
            ]);

            return {
                period,
                topExpenses: expenses.map(e => ({
                    category: e._id || 'Uncategorized',
                    amount: e.total,
                    count: e.count
                }))
            };
        },
    }),

    getRecentTransactions: tool({
        description: 'Get a list of the most recent transactions.',
        inputSchema: z.object({
            limit: z.number().optional().default(5).describe('Number of transactions to return'),
            type: z.string().optional().default('all').describe('Filter by transaction type (all, income, expense)'),
        }),
        execute: async ({ limit = 5, type = 'all' }: { limit?: number; type?: string }) => {
            console.log('=== getRecentTransactions EXECUTED ===');
            console.log('Params:', { limit, type });
            
            await dbConnect();

            const query: any = {};
            if (type !== 'all') {
                query.type = type;
            }

            console.log('MongoDB query:', query);

            const transactions = await Transaction.find(query)
                .sort({ date: -1 })
                .limit(limit)
                .select('date description amount type categoryName projectName');

            console.log('Found recent transactions:', transactions.length);

            const result = {
                transactions: transactions.map(t => ({
                    date: t.date.toISOString().split('T')[0],
                    description: t.description,
                    amount: t.amount,
                    type: t.type,
                    category: t.categoryName || 'N/A',
                    project: t.projectName || 'N/A'
                }))
            };

            console.log('getRecentTransactions result:', result);
            return result;
        },
    }),

    getProjectSummary: tool({
        description: 'Get financial summary for a specific project or all projects.',
        inputSchema: z.object({
            projectName: z.string().optional().describe('Name of the project to filter by. If omitted, returns summary for all active projects.'),
        }),
        execute: async ({ projectName }: { projectName?: string }) => {
            console.log('=== getProjectSummary EXECUTED ===');
            console.log('Project name filter:', projectName);

            await dbConnect();

            const matchStage: any = {};
            if (projectName) {
                // Simple case-insensitive regex match
                matchStage.projectName = { $regex: new RegExp(projectName, 'i') };
            } else {
                matchStage.projectName = { $ne: null };
            }

            console.log('MongoDB match stage:', matchStage);

            const projectStats = await Transaction.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: '$projectName',
                        income: {
                            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
                        },
                        expenses: {
                            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
                        },
                        transactionCount: { $sum: 1 }
                    }
                },
                { $sort: { income: -1 } } // Sort by highest income
            ]);

            console.log('Project aggregation result:', projectStats.length, 'projects');

            const result = {
                projects: projectStats.map(p => ({
                    name: p._id,
                    income: p.income,
                    expenses: p.expenses,
                    profit: p.income - p.expenses,
                    transactionCount: p.transactionCount
                }))
            };

            console.log('getProjectSummary result:', result);
            return result;
        },
    }),
};
