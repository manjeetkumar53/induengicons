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

            const query: Record<string, unknown> = {};
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

            const matchStage: Record<string, unknown> = {};
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

    getBudgetAnalysis: tool({
        description: 'Analyze budget vs actuals for projects.',
        inputSchema: z.object({
            projectId: z.string().optional().describe('Specific project ID to analyze. If omitted, analyzes all active projects.'),
        }),
        execute: async ({ projectId }: { projectId?: string }) => {
            console.log('=== getBudgetAnalysis EXECUTED ===');
            await dbConnect();

            const matchStage: Record<string, unknown> = {
                status: 'active'
            };

            if (projectId) {
                matchStage._id = new mongoose.Types.ObjectId(projectId);
            }

            const projects = await Project.find(matchStage).select('name budget timeline status');

            const analysis = projects.map(p => {
                const totalBudget = p.budget.totalBudget || 0;
                const spent = p.budget.spentAmount || 0;
                const remaining = totalBudget - spent;
                const percentSpent = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;

                return {
                    name: p.name,
                    totalBudget,
                    spent,
                    remaining,
                    percentSpent: parseFloat(percentSpent.toFixed(2)),
                    status: percentSpent > 90 ? 'CRITICAL' : percentSpent > 75 ? 'WARNING' : 'OK'
                };
            });

            return {
                analysis: analysis.sort((a, b) => b.percentSpent - a.percentSpent)
            };
        }
    }),

    getCashFlowForecast: tool({
        description: 'Forecast cash flow based on recent historical data.',
        inputSchema: z.object({
            months: z.number().optional().default(3).describe('Number of months to forecast'),
        }),
        execute: async ({ months = 3 }: { months?: number }) => {
            console.log('=== getCashFlowForecast EXECUTED ===');
            await dbConnect();

            // Get last 6 months of data to calculate average
            const end = new Date();
            const start = new Date();
            start.setMonth(start.getMonth() - 6);

            const transactions = await Transaction.aggregate([
                {
                    $match: {
                        date: { $gte: start, $lte: end }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$date" },
                            month: { $month: "$date" },
                            type: "$type"
                        },
                        total: { $sum: "$amount" }
                    }
                }
            ]);

            // Calculate monthly averages
            let totalIncome = 0;
            let totalExpense = 0;
            const monthCount = 6;

            transactions.forEach(t => {
                if (t._id.type === 'income') totalIncome += t.total;
                if (t._id.type === 'expense') totalExpense += t.total;
            });

            const avgMonthlyIncome = totalIncome / monthCount;
            const avgMonthlyExpense = totalExpense / monthCount;
            const projectedNet = avgMonthlyIncome - avgMonthlyExpense;

            const forecast = [];
            const currentBalance = 0; // This should ideally come from a real balance check

            for (let i = 1; i <= months; i++) {
                const date = new Date();
                date.setMonth(date.getMonth() + i);

                forecast.push({
                    month: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
                    projectedIncome: avgMonthlyIncome,
                    projectedExpense: avgMonthlyExpense,
                    projectedNet: projectedNet,
                    accumulatedBalance: currentBalance + (projectedNet * i)
                });
            }

            return {
                basis: '6-month average',
                avgMonthlyIncome,
                avgMonthlyExpense,
                forecast
            };
        }
    }),

    getVendorAnalysis: tool({
        description: 'Analyze spending by vendor/source.',
        inputSchema: z.object({
            limit: z.number().optional().default(5).describe('Number of top vendors to return'),
        }),
        execute: async ({ limit = 5 }: { limit?: number }) => {
            console.log('=== getVendorAnalysis EXECUTED ===');
            await dbConnect();

            const vendors = await Transaction.aggregate([
                {
                    $match: {
                        type: 'expense',
                        source: { $ne: null }
                    }
                },
                {
                    $group: {
                        _id: "$source",
                        totalSpent: { $sum: "$amount" },
                        transactionCount: { $sum: 1 },
                        lastTransaction: { $max: "$date" }
                    }
                },
                { $sort: { totalSpent: -1 } },
                { $limit: limit }
            ]);

            return {
                vendors: vendors.map(v => ({
                    name: v._id,
                    totalSpent: v.totalSpent,
                    transactionCount: v.transactionCount,
                    lastTransaction: v.lastTransaction
                }))
            };
        }
    }),
};
