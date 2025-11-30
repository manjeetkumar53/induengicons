import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Transaction } from '@/lib/models';

export async function GET() {
    try {
        console.log('=== Testing All AI Tools ===');
        
        const results: any = {};
        
        await dbConnect();

        // Test getProfitLoss functionality directly
        try {
            console.log('Testing getProfitLoss...');
            
            // Simulate the getProfitLoss logic
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = now;

            const transactions = await Transaction.find({
                date: { $gte: start, $lte: end }
            });

            const income = transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const expenses = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            const profitLoss = {
                period: 'this_month',
                income,
                expenses,
                netProfit: income - expenses,
                margin: income > 0 ? ((income - expenses) / income) * 100 : 0
            };
            
            results.getProfitLoss = { success: true, data: profitLoss };
            console.log('✅ getProfitLoss working');
        } catch (error: any) {
            results.getProfitLoss = { success: false, error: error.message };
            console.log('❌ getProfitLoss failed:', error.message);
        }

        // Test getRecentTransactions functionality directly
        try {
            console.log('Testing getRecentTransactions...');
            
            const transactions = await Transaction.find({})
                .sort({ date: -1 })
                .limit(3)
                .select('date description amount type categoryName projectName');

            const recent = {
                transactions: transactions.map(t => ({
                    date: t.date.toISOString().split('T')[0],
                    description: t.description,
                    amount: t.amount,
                    type: t.type,
                    category: t.categoryName || 'N/A',
                    project: t.projectName || 'N/A'
                }))
            };
            
            results.getRecentTransactions = { success: true, count: recent.transactions.length };
            console.log('✅ getRecentTransactions working');
        } catch (error: any) {
            results.getRecentTransactions = { success: false, error: error.message };
            console.log('❌ getRecentTransactions failed:', error.message);
        }

        // Test getProjectSummary functionality directly
        try {
            console.log('Testing getProjectSummary...');
            
            const projectStats = await Transaction.aggregate([
                { $match: { projectName: { $ne: null } } },
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
                { $sort: { income: -1 } }
            ]);

            const projects = {
                projects: projectStats.map(p => ({
                    name: p._id,
                    income: p.income,
                    expenses: p.expenses,
                    profit: p.income - p.expenses,
                    transactionCount: p.transactionCount
                }))
            };
            
            results.getProjectSummary = { success: true, projectCount: projects.projects.length };
            console.log('✅ getProjectSummary working');
        } catch (error: any) {
            results.getProjectSummary = { success: false, error: error.message };
            console.log('❌ getProjectSummary failed:', error.message);
        }

        // Test searchTransactions functionality directly
        try {
            console.log('Testing searchTransactions...');
            
            const searchQuery = 'expense';
            const searchRegex = new RegExp(searchQuery, 'i');

            const transactions = await Transaction.find({
                $or: [
                    { description: searchRegex },
                    { projectName: searchRegex },
                    { categoryName: searchRegex },
                    { source: searchRegex }
                ]
            })
            .sort({ date: -1 })
            .limit(3)
            .lean();

            const search = {
                success: true,
                results: transactions.map((t: any) => ({
                    id: t._id.toString(),
                    date: t.date.toISOString().split('T')[0],
                    description: t.description,
                    amount: t.amount,
                    type: t.type,
                    project: t.projectName || 'N/A',
                    category: t.categoryName || 'N/A',
                    source: t.source || 'N/A'
                })),
                metadata: {
                    totalFound: transactions.length,
                    searchType: 'text-search',
                    query: searchQuery
                }
            };
            
            results.searchTransactions = { success: true, found: search.results.length };
            console.log('✅ searchTransactions working');
        } catch (error: any) {
            results.searchTransactions = { success: false, error: error.message };
            console.log('❌ searchTransactions failed:', error.message);
        }

        const allSuccess = Object.values(results).every((r: any) => r.success);

        return NextResponse.json({
            success: allSuccess,
            message: allSuccess ? 'All tools working correctly!' : 'Some tools have issues',
            toolResults: results,
            availableTools: ['searchTransactions', 'advancedSearch', 'getProfitLoss', 'getTopExpenses', 'getRecentTransactions', 'getProjectSummary']
        });

    } catch (error: any) {
        console.error('Tool testing error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            availableTools: ['searchTransactions', 'advancedSearch', 'getProfitLoss', 'getTopExpenses', 'getRecentTransactions', 'getProjectSummary']
        }, { status: 500 });
    }
}