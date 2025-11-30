import { NextResponse } from 'next/server'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

export async function GET() {
    try {
        // Test 1: Check if API key is loaded
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
        if (!apiKey) {
            return NextResponse.json({
                success: false,
                error: 'GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set'
            })
        }

        console.log('API Key found:', apiKey.substring(0, 20) + '...')

        // Test 2: Simple text generation (no tools)
        const result = await generateText({
            model: google('gemini-2.0-flash'),
            prompt: 'Say hello in exactly 5 words.'
        })

        return NextResponse.json({
            success: true,
            message: 'Google API setup is working correctly',
            testResponse: result.text,
            apiKeyStatus: 'Found',
            apiKeyPrefix: apiKey.substring(0, 20) + '...'
        })

    } catch (error: any) {
        console.error('Google API Test Error:', error)
        
        return NextResponse.json({
            success: false,
            error: error.message || 'Unknown error',
            details: {
                name: error.name,
                cause: error.cause,
                statusCode: error.statusCode,
                responseBody: error.responseBody
            }
        })
    }
}