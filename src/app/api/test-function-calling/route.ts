import { NextResponse } from 'next/server'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { z } from 'zod'

export async function GET() {
    try {
        // Test simple function calling with a basic object-style tool definition
        const result = await generateText({
            model: google('gemini-flash-latest'),
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

    } catch (error: unknown) {
        console.error('Function Calling Test Error:', error)

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Function calling test failed',
            details: error instanceof Error ? {
                name: error.name,
                cause: (error as Error & { cause?: unknown }).cause,
                statusCode: (error as Error & { statusCode?: unknown }).statusCode,
                responseBody: (error as Error & { responseBody?: unknown }).responseBody
            } : { message: 'Unknown error type' }
        })
    }
}