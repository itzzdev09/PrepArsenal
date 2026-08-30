# Redis Cache Setup for PrepArsenal

This document explains how to configure Redis caching to reduce PYQ database reads by 25%.

## Overview

The Redis caching layer provides:
- **Question Caching**: Caches PYQ queries with 1-hour TTL
- **Exam Caching**: Caches exam lists with 24-hour TTL  
- **Topic Caching**: Caches topic lists with 24-hour TTL
- **Rate Limiting**: Prevents database abuse with sliding window rate limits
- **Automatic Invalidation**: Cache clears on admin question updates

## Environment Configuration

Add the following to your `.env.local` file:

```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379
# OR for production (Redis Cloud, Upstash, etc.):
# REDIS_URL=rediss://default:password@host:port
```

## Redis Providers

### Local Development
```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or install Redis directly
# Windows: Download from https://redis.io/download
# macOS: brew install redis && brew services start redis
# Linux: sudo apt-get install redis-server
```

### Production Options

**Upstash (Recommended for Vercel)**
1. Create account at https://upstash.com/
2. Create Redis database
3. Copy REST URL or Redis URL
4. Set `REDIS_URL` in environment variables

**Redis Cloud**
1. Create account at https://redis.com/try-free/
2. Create database
3. Copy connection string
4. Set `REDIS_URL` in environment variables

**AWS ElastiCache**
1. Create Redis cluster in AWS
2. Configure security group
3. Use endpoint as `REDIS_URL`

## Cache Configuration

Current TTL settings (can be modified in `lib/cache/redis-cache.ts`):

- Questions: 1 hour (3600 seconds)
- Exams: 24 hours (86400 seconds)  
- Topics: 24 hours (86400 seconds)
- Rate Limit Window: 1 minute (60 seconds)

Rate limits per operation:
- `getExams`: 200 requests/minute
- `getTopics`: 300 requests/minute
- `getQuestions`: 500 requests/minute per filter combination

## API Endpoints

### Cache Statistics
```bash
GET /api/admin/cache-stats
```

Returns:
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "questionsKeys": 15,
    "examsCached": true,
    "topicsKeys": 8
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Clear All Cache (Emergency)
```bash
POST /api/admin/cache-clear
```

## Monitoring

Monitor cache effectiveness through:
1. Cache hit rates via `/api/admin/cache-stats`
2. Redis CLI: `redis-cli INFO stats`
3. Redis monitoring: `redis-cli MONITOR`

## Troubleshooting

**Redis connection failed**
- Verify `REDIS_URL` is set correctly
- Check Redis server is running
- Ensure network connectivity

**Cache not working**
- Check logs for "Redis not configured" warning
- Verify Redis client initialization
- Test with `redis-cli PING`

**High memory usage**
- Reduce TTL values in `redis-cache.ts`
- Monitor with `redis-cli INFO memory`
- Consider Redis maxmemory setting

## Performance Impact

Expected improvements:
- **25% reduction** in database reads for common queries
- **Sub-millisecond** cache response times
- **Reduced latency** for exam/topic listings
- **Protection** against database overload during traffic spikes

## Cache Invalidation

Cache automatically invalidates on:
- Admin question updates (invalidates relevant filter combinations)
- Admin question deletions (invalidates all question caches)
- Manual cache clear via API endpoint

TTL-based expiration ensures stale data is refreshed automatically.
