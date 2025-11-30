import { Redis } from '@upstash/redis'

// Initialize Upstash Redis client
export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
})

/**
 * Get cached data
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
    try {
        if (!process.env.UPSTASH_REDIS_REST_URL) {
            console.warn('[Cache] Redis not configured, skipping cache get')
            return null
        }

        const data = await redis.get(key)
        if (data) {
            console.log(`[Cache] HIT: ${key}`)
        }
        return data as T
    } catch (error) {
        console.error('[Cache] Get error:', error)
        return null
    }
}

/**
 * Set cached data with TTL
 */
export async function cacheSet(
    key: string,
    value: any,
    ttl: number
): Promise<void> {
    try {
        if (!process.env.UPSTASH_REDIS_REST_URL) {
            console.warn('[Cache] Redis not configured, skipping cache set')
            return
        }

        await redis.setex(key, ttl, JSON.stringify(value))
        console.log(`[Cache] SET: ${key} (TTL: ${ttl}s)`)
    } catch (error) {
        console.error('[Cache] Set error:', error)
    }
}

/**
 * Delete cached data
 */
export async function cacheDel(key: string): Promise<void> {
    try {
        if (!process.env.UPSTASH_REDIS_REST_URL) {
            return
        }

        await redis.del(key)
        console.log(`[Cache] DEL: ${key}`)
    } catch (error) {
        console.error('[Cache] Del error:', error)
    }
}

/**
 * Generate cache key from parameters
 */
export function generateCacheKey(
    prefix: string,
    params: Record<string, any>
): string {
    const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}:${params[key]}`)
        .join('|')

    return `${prefix}:${sortedParams}`
}

/**
 * Cache TTL constants
 */
export const CacheTTL = {
    INSTANT: 10,        // 10 seconds - real-time data
    SHORT: 60,          // 1 minute - frequently changing
    MEDIUM: 300,        // 5 minutes - reports
    LONG: 3600,         // 1 hour - historical data
    DAY: 86400          // 24 hours - archived data
} as const
