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
            model: google('gemini-2.0-flash'),
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
                const data = toolResult.output as any;
                responseText = `## Profit & Loss for ${data.period?.replace('_', ' ') || 'Current Period'}

**Income:** ₹${data.income?.toLocaleString('en-IN') || '0'}
**Expenses:** ₹${data.expenses?.toLocaleString('en-IN') || '0'}
**Net Profit:** ₹${data.netProfit?.toLocaleString('en-IN') || '0'}
**Profit Margin:** ${data.margin?.toFixed(2) || '0'}%

${data.netProfit > 0 ? '✅ You have a positive profit this month!' : '⚠️ Your expenses exceed income this month.'}`;
            } else if (toolName === 'getRecentTransactions' && toolResult.output) {
                const data = toolResult.output as any;
                responseText = `## Recent Transactions

Found **${data.transactions?.length || 0}** transactions:

${data.transactions?.map((t: any, i: number) => 
    `${i + 1}. **${t.description}** - ₹${t.amount.toLocaleString('en-IN')} (${t.type}) - ${t.date}`
).join('\n') || 'No transactions found'}`;
            } else if (toolName === 'getProjectSummary' && toolResult.output) {
                const data = toolResult.output as any;
                responseText = `## Project Summary

Found **${data.projects?.length || 0}** projects:

${data.projects?.map((p: any) => 
    `**${p.name}**\n- Income: ₹${p.income?.toLocaleString('en-IN') || '0'}\n- Expenses: ₹${p.expenses?.toLocaleString('en-IN') || '0'}\n- Profit: ₹${p.profit?.toLocaleString('en-IN') || '0'}\n- Transactions: ${p.transactionCount || 0}`
).join('\n\n') || 'No projects found'}`;
            } else if (toolName === 'searchTransactions' && toolResult.output) {
                const data = toolResult.output as any;
                responseText = `## Search Results

Found **${data.results?.length || 0}** matching transactions:

${data.results?.map((t: any, i: number) => 
    `${i + 1}. **${t.description}** - ₹${t.amount.toLocaleString('en-IN')} (${t.type}) - ${t.date} - ${t.project}`
).join('\n') || 'No transactions found'}`;
            } else if (toolName === 'getTopExpenses' && toolResult.output) {
                const data = toolResult.output as any;
                responseText = `## Top Expenses for ${data.period?.replace('_', ' ') || 'Current Period'}

${data.topExpenses?.map((e: any, i: number) => 
    `${i + 1}. **${e.category}** - ₹${e.amount?.toLocaleString('en-IN') || '0'} (${e.count || 0} transactions)`
).join('\n') || 'No expenses found'}`;
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
        
    } catch (error: any) {
        console.error('AI Chat Error:', error);
        
        return new Response(
            JSON.stringify({ 
                success: false,
                error: error.message || 'AI request failed',
                details: error.toString()
            }), 
            { 
                status: 500, 
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
