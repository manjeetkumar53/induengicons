import { NextResponse } from 'next/server'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { z } from 'zod'

export async function GET() {
    try {
        // Test simple function calling with a basic object-style tool definition
        const result = await generateText({
            model: google('gemini-2.0-flash'),
            prompt: 'Add 5 and 3',
            tools: {
                addNumbers: {
                    description: 'Add two numbers',
                    inputSchema: z.object({
                        a: z.number().describe('First number'),
                        b: z.number().describe('Second number')
                    }),
                    execute: async ({ a, b }: { a: number; b: number }) => {
                        return { result: a + b }
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Function calling test successful',
            result: result.text,
            toolCalls: result.toolCalls || [],
            steps: result.steps || []
        })

    } catch (error: any) {
        console.error('Function Calling Test Error:', error)
        
        return NextResponse.json({
            success: false,
            error: error.message || 'Function calling test failed',
            details: {
                name: error.name,
                cause: error.cause,
                statusCode: error.statusCode,
                responseBody: error.responseBody
            }
        })
    }
}