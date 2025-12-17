import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { tools } from '@/lib/ai/tools';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    try {
        // Use generateText for reliable responses
        const result = await generateText({
            model: google('gemini-flash-latest'),
            messages,
            tools,
            system: `You are a helpful financial assistant for a construction/engineering company. 
        You have access to real-time financial data including transactions, projects, income, and expenses.
        
        When answering:
        - ALWAYS use tools when the user asks for data - don't ask for clarification unless absolutely necessary
        - Use reasonable defaults: for recent transactions, show 5-10 transactions of type 'all'
        - Format currency in Indian Rupees (₹) using proper formatting  
        - Be concise but helpful
        - If you calculate something, explain how you got the number
        - Use Markdown for formatting (bold for numbers, lists for breakdowns)
        
        Available tools and when to use them:
        - getProfitLoss: For profit, loss, income vs expenses questions (use defaults like 'this_month')
        - getRecentTransactions: For recent/latest transactions (default: 5-10 transactions, type 'all')
        - searchTransactions: For searching specific transactions by description/keyword  
        - getTopExpenses: For top expense categories
        - getProjectSummary: For project summaries and financial breakdowns
        - getBudgetAnalysis: For project budget status, overspending, or remaining budget questions
        - getCashFlowForecast: For future financial projections and cash flow trends
        - getVendorAnalysis: For vendor spending analysis and top suppliers
        
        IMPORTANT: Use tools immediately with sensible defaults rather than asking the user for more details.`,
            // @ts-expect-error - maxSteps is supported but not in types
            maxSteps: 10,
        });

        // If we have tool results but no text, generate a response based on the tool results
        let responseText = result.text;

        if (!responseText && result.toolResults && result.toolResults.length > 0) {
            // Generate a helpful response based on the tool results
            const toolResult = result.toolResults[0];
            const toolName = result.toolCalls?.[0]?.toolName;

            if (toolName === 'getProfitLoss' && toolResult.output) {
                const data = toolResult.output as Record<string, unknown>
                responseText = `## Profit & Loss for ${(data.period as string)?.replace('_', ' ') || 'Current Period'}

**Income:** ₹${(data.income as number)?.toLocaleString('en-IN') || '0'}
**Expenses:** ₹${(data.expenses as number)?.toLocaleString('en-IN') || '0'}
**Net Profit:** ₹${(data.netProfit as number)?.toLocaleString('en-IN') || '0'}
**Profit Margin:** ${(data.margin as number)?.toFixed(2) || '0'}%

${(data.netProfit as number) > 0 ? '✅ You have a positive profit this month!' : '⚠️ Your expenses exceed income this month.'}`
            } else if (toolName === 'getRecentTransactions' && toolResult.output) {
                const data = toolResult.output as Record<string, unknown>
                responseText = `## Recent Transactions

Found **${(data.transactions as Array<unknown>)?.length || 0}** transactions:

${(data.transactions as Array<Record<string, unknown>>)?.map((t, i: number) =>
                    `${i + 1}. **${t.description}** - ₹${(t.amount as number).toLocaleString('en-IN')} (${t.type}) - ${t.date}`
                ).join('\n') || 'No transactions found'}`;
            } else if (toolName === 'getProjectSummary' && toolResult.output) {
                const data = toolResult.output as Record<string, unknown>
                responseText = `## Project Summary

Found **${(data.projects as Array<unknown>)?.length || 0}** projects:

${(data.projects as Array<Record<string, unknown>>)?.map((p) =>
                    `**${p.name}**\n- Income: ₹${(p.income as number)?.toLocaleString('en-IN') || '0'}\n- Expenses: ₹${(p.expenses as number)?.toLocaleString('en-IN') || '0'}\n- Profit: ₹${(p.profit as number)?.toLocaleString('en-IN') || '0'}\n- Transactions: ${p.transactionCount || 0}`
                ).join('\n\n') || 'No projects found'}`;
            } else if (toolName === 'searchTransactions' && toolResult.output) {
                const data = toolResult.output as Record<string, unknown>
                responseText = `## Search Results

Found **${(data.results as Array<unknown>)?.length || 0}** matching transactions:

${(data.results as Array<Record<string, unknown>>)?.map((t, i: number) =>
                    `${i + 1}. **${t.description}** - ₹${(t.amount as number).toLocaleString('en-IN')} (${t.type}) - ${t.date} - ${t.project}`
                ).join('\n') || 'No transactions found'}`;
            } else if (toolName === 'getTopExpenses' && toolResult.output) {
                const data = toolResult.output as Record<string, unknown>
                responseText = `## Top Expenses for ${(data.period as string)?.replace('_', ' ') || 'Current Period'}

${(data.topExpenses as Array<Record<string, unknown>>)?.map((e, i: number) =>
                    `${i + 1}. **${e.category}** - ₹${(e.amount as number)?.toLocaleString('en-IN') || '0'} (${e.count || 0} transactions)`
                ).join('\n') || 'No expenses found'}`;
            } else if (toolName === 'getBudgetAnalysis' && toolResult.output) {
                const data = toolResult.output as Record<string, unknown>
                responseText = `## Budget Analysis
                
${(data.analysis as Array<Record<string, unknown>>)?.map(p =>
                    `**${p.name}** [${p.status}]\n- Budget: ₹${(p.totalBudget as number)?.toLocaleString('en-IN')}\n- Spent: ₹${(p.spent as number)?.toLocaleString('en-IN')} (${p.percentSpent}%)\n- Remaining: ₹${(p.remaining as number)?.toLocaleString('en-IN')}`
                ).join('\n\n') || 'No active projects found'}`;
            } else if (toolName === 'getCashFlowForecast' && toolResult.output) {
                const data = toolResult.output as Record<string, unknown>
                responseText = `## Cash Flow Forecast (Next 3 Months)
                
Based on 6-month average (Income: ₹${(data.avgMonthlyIncome as number)?.toLocaleString('en-IN')}, Expense: ₹${(data.avgMonthlyExpense as number)?.toLocaleString('en-IN')})

${(data.forecast as Array<Record<string, unknown>>)?.map(m =>
                    `**${m.month}**\n- Net: ₹${(m.projectedNet as number)?.toLocaleString('en-IN')}\n- Balance: ₹${(m.accumulatedBalance as number)?.toLocaleString('en-IN')}`
                ).join('\n\n')}`;
            } else if (toolName === 'getVendorAnalysis' && toolResult.output) {
                const data = toolResult.output as Record<string, unknown>
                responseText = `## Top Vendors
                
${(data.vendors as Array<Record<string, unknown>>)?.map((v, i) =>
                    `${i + 1}. **${v.name}**\n- Total: ₹${(v.totalSpent as number)?.toLocaleString('en-IN')}\n- Transactions: ${v.transactionCount}`
                ).join('\n\n') || 'No vendor data found'}`;
            } else {
                responseText = `I retrieved the data successfully. Here are the results:\n\n${JSON.stringify(toolResult.output, null, 2)}`;
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                text: responseText || 'I was unable to generate a response. Please try again.',
                toolCalls: result.toolCalls,
                steps: result.steps?.length || 0
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error: unknown) {
        console.error('AI Chat Error:', error)

        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'AI request failed',
                details: error instanceof Error ? error.toString() : String(error)
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
