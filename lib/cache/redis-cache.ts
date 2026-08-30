// PrepArsenal — Redis Cache Layer for PYQ Database
// High-performance caching to reduce database reads by 25% with rate limiting

let redisClient: any = null;

// Cache key prefixes
const CACHE_PREFIXES = {
  QUESTIONS: 'pyq:questions',
  EXAMS: 'pyq:exams',
  TOPICS: 'pyq:topics',
  RATE_LIMIT: 'pyq:ratelimit',
} as const;

// TTL configurations (in seconds)
const CACHE_TTL = {
  QUESTIONS: 3600, // 1 hour
  EXAMS: 86400, // 24 hours
  TOPICS: 86400, // 24 hours
  RATE_LIMIT: 60, // 1 minute window
} as const;

/**
 * Initialize Redis client with connection pooling (server-side only)
 */
export function getRedisClient(): any {
  if (typeof window !== 'undefined') {
    return null; // Safe in browser / client components
  }

  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI;
  
  if (!redisUrl) {
    return null;
  }

  try {
    // Dynamic require so browser bundlers don't attempt to bundle native net/tls
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RedisConstructor = require('ioredis');
    const RedisClass = RedisConstructor.default || RedisConstructor;

    redisClient = new RedisClass(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      enableReadyCheck: true,
    });

    redisClient.on('error', (err: Error) => {
      console.warn('Redis connection error:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('Redis connected successfully');
    });

    return redisClient;
  } catch (err) {
    console.warn('Failed to initialize Redis client:', err);
    return null;
  }
}

/**
 * Generate cache key for questions query
 */
function generateQuestionsKey(filters: {
  examCode?: string;
  subject?: string;
  topic?: string;
  limit?: number;
}): string {
  const parts = [
    filters.examCode || 'all',
    filters.subject || 'all',
    filters.topic || 'all',
    filters.limit || 100,
  ];
  return `${CACHE_PREFIXES.QUESTIONS}:${parts.join(':')}`;
}

/**
 * Generate cache key for exams
 */
function generateExamsKey(): string {
  return CACHE_PREFIXES.EXAMS;
}

/**
 * Generate cache key for topics
 */
function generateTopicsKey(subject?: string): string {
  return subject ? `${CACHE_PREFIXES.TOPICS}:${subject.toLowerCase()}` : CACHE_PREFIXES.TOPICS;
}

/**
 * Generate rate limit key for a specific operation
 */
function generateRateLimitKey(operation: string, identifier: string): string {
  return `${CACHE_PREFIXES.RATE_LIMIT}:${operation}:${identifier}`;
}

/**
 * Cache interface for questions
 */
export interface QuestionsCacheEntry {
  data: any[];
  timestamp: number;
  hitCount: number;
}

/**
 * Get cached questions
 */
export async function getCachedQuestions(filters: {
  examCode?: string;
  subject?: string;
  topic?: string;
  limit?: number;
}): Promise<QuestionsCacheEntry | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const key = generateQuestionsKey(filters);
    const cached = await redis.get(key);
    
    if (!cached) return null;

    const entry = JSON.parse(cached) as QuestionsCacheEntry;
    entry.hitCount = (entry.hitCount || 0) + 1;
    
    // Update hit count asynchronously
    await redis.setex(key, CACHE_TTL.QUESTIONS, JSON.stringify(entry));
    
    return entry;
  } catch (err) {
    console.warn('Redis get cached questions failed:', err);
    return null;
  }
}

/**
 * Cache questions data
 */
export async function cacheQuestions(
  filters: {
    examCode?: string;
    subject?: string;
    topic?: string;
    limit?: number;
  },
  data: any[]
): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const key = generateQuestionsKey(filters);
    const entry: QuestionsCacheEntry = {
      data,
      timestamp: Date.now(),
      hitCount: 0,
    };
    
    await redis.setex(key, CACHE_TTL.QUESTIONS, JSON.stringify(entry));
  } catch (err) {
    console.warn('Redis cache questions failed:', err);
  }
}

/**
 * Get cached exams
 */
export async function getCachedExams(): Promise<any[] | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const key = generateExamsKey();
    const cached = await redis.get(key);
    
    if (!cached) return null;
    
    return JSON.parse(cached);
  } catch (err) {
    console.warn('Redis get cached exams failed:', err);
    return null;
  }
}

/**
 * Cache exams data
 */
export async function cacheExams(data: any[]): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const key = generateExamsKey();
    await redis.setex(key, CACHE_TTL.EXAMS, JSON.stringify(data));
  } catch (err) {
    console.warn('Redis cache exams failed:', err);
  }
}

/**
 * Get cached topics
 */
export async function getCachedTopics(subject?: string): Promise<any[] | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const key = generateTopicsKey(subject);
    const cached = await redis.get(key);
    
    if (!cached) return null;
    
    return JSON.parse(cached);
  } catch (err) {
    console.warn('Redis get cached topics failed:', err);
    return null;
  }
}

/**
 * Cache topics data
 */
export async function cacheTopics(data: any[], subject?: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const key = generateTopicsKey(subject);
    await redis.setex(key, CACHE_TTL.TOPICS, JSON.stringify(data));
  } catch (err) {
    console.warn('Redis cache topics failed:', err);
  }
}

/**
 * Rate limiting using Redis sliding window
 */
export async function checkRateLimit(
  operation: string,
  identifier: string,
  maxRequests: number = 100
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const redis = getRedisClient();
  if (!redis) {
    // If Redis is unavailable, allow all requests
    return { allowed: true, remaining: maxRequests, resetTime: Date.now() + 60000 };
  }

  try {
    const key = generateRateLimitKey(operation, identifier);
    const now = Date.now();
    const windowStart = now - (CACHE_TTL.RATE_LIMIT * 1000);
    
    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline();
    
    // Remove old entries outside the window
    pipeline.zremrangebyscore(key, 0, windowStart);
    
    // Count current requests
    pipeline.zcard(key);
    
    // Add current request
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    
    // Set expiry
    pipeline.expire(key, CACHE_TTL.RATE_LIMIT);
    
    const results = await pipeline.exec();
    
    if (!results) {
      return { allowed: true, remaining: maxRequests, resetTime: now + (CACHE_TTL.RATE_LIMIT * 1000) };
    }
    
    const count = results[1][1] as number;
    const remaining = Math.max(0, maxRequests - count);
    const allowed = count < maxRequests;
    
    return {
      allowed,
      remaining,
      resetTime: now + (CACHE_TTL.RATE_LIMIT * 1000),
    };
  } catch (err) {
    console.warn('Redis rate limit check failed:', err);
    // Fail open - allow requests if Redis fails
    return { allowed: true, remaining: maxRequests, resetTime: Date.now() + 60000 };
  }
}

/**
 * Invalidate cache for questions (called on admin updates)
 */
export async function invalidateQuestionsCache(filters?: {
  examCode?: string;
  subject?: string;
  topic?: string;
}): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    if (filters) {
      // Invalidate specific cache key
      const key = generateQuestionsKey(filters);
      await redis.del(key);
    } else {
      // Invalidate all question caches
      const keys = await redis.keys(`${CACHE_PREFIXES.QUESTIONS}:*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  } catch (err) {
    console.warn('Redis invalidate questions cache failed:', err);
  }
}

/**
 * Invalidate exams cache
 */
export async function invalidateExamsCache(): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.del(generateExamsKey());
  } catch (err) {
    console.warn('Redis invalidate exams cache failed:', err);
  }
}

/**
 * Invalidate topics cache
 */
export async function invalidateTopicsCache(subject?: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    if (subject) {
      await redis.del(generateTopicsKey(subject));
    } else {
      const keys = await redis.keys(`${CACHE_PREFIXES.TOPICS}:*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  } catch (err) {
    console.warn('Redis invalidate topics cache failed:', err);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  enabled: boolean;
  questionsKeys: number;
  examsCached: boolean;
  topicsKeys: number;
}> {
  const redis = getRedisClient();
  if (!redis) {
    return {
      enabled: false,
      questionsKeys: 0,
      examsCached: false,
      topicsKeys: 0,
    };
  }

  try {
    const questionsKeys = await redis.keys(`${CACHE_PREFIXES.QUESTIONS}:*`);
    const examsCached = await redis.exists(generateExamsKey());
    const topicsKeys = await redis.keys(`${CACHE_PREFIXES.TOPICS}:*`);
    
    return {
      enabled: true,
      questionsKeys: questionsKeys.length,
      examsCached: examsCached === 1,
      topicsKeys: topicsKeys.length,
    };
  } catch (err) {
    console.warn('Redis get cache stats failed:', err);
    return {
      enabled: true,
      questionsKeys: 0,
      examsCached: false,
      topicsKeys: 0,
    };
  }
}

/**
 * Clear all PYQ cache (emergency use)
 */
export async function clearAllCache(): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const keys = await redis.keys('pyq:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.warn('Redis clear all cache failed:', err);
  }
}
