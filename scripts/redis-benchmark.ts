// PrepArsenal — Redis Cache Benchmark
// Controlled benchmark to measure Redis cache performance without external dependencies

import {
  getRedisClient,
  getCachedQuestions,
  cacheQuestions,
  getCachedExams,
  cacheExams,
  getCachedTopics,
  cacheTopics,
  checkRateLimit,
  getCacheStats,
  clearAllCache,
} from '../lib/cache/redis-cache';

// Mock database functions to simulate real behavior
let mockDatabaseCallCount = 0;
let mockDatabaseLatencyMs = 50; // Simulated DB latency

interface MockQuestion {
  id: string;
  examCode: string;
  subject: string;
  topic: string;
  questionText: string;
  options: string[];
  correctOption: number;
}

const mockQuestions: MockQuestion[] = Array.from({ length: 100 }, (_, i) => ({
  id: `q${i}`,
  examCode: i % 2 === 0 ? 'SSC_CGL' : 'IBPS_PO',
  subject: i % 3 === 0 ? 'Polity' : i % 3 === 1 ? 'Economy' : 'History',
  topic: `Topic ${Math.floor(i / 10)}`,
  questionText: `Mock question ${i}`,
  options: ['A', 'B', 'C', 'D'],
  correctOption: 0,
}));

const mockExams = [
  { id: 'SSC_CGL', code: 'SSC_CGL', name: 'SSC CGL', icon: '📝' },
  { id: 'IBPS_PO', code: 'IBPS_PO', name: 'IBPS PO', icon: '🏦' },
];

const mockTopics = [
  { id: 't1', subject: 'Polity', name: 'Constitution' },
  { id: 't2', subject: 'Economy', name: 'Banking' },
  { id: 't3', subject: 'History', name: 'Freedom Movement' },
];

// Simulated database function with latency tracking
async function mockDatabaseQuery<T>(
  queryType: string,
  data: T[]
): Promise<{ data: T; latencyMs: number; wasCached: boolean }> {
  const startTime = Date.now();
  mockDatabaseCallCount++;
  
  // Simulate database latency
  await new Promise(resolve => setTimeout(resolve, mockDatabaseLatencyMs));
  
  const latencyMs = Date.now() - startTime;
  return { data: data[0], latencyMs, wasCached: false };
}

// Simulated cached function
async function mockCachedQuery<T>(
  queryType: string,
  cacheKey: string,
  data: T[],
  getCached: () => Promise<T | null>,
  setCached: (data: T) => Promise<void>
): Promise<{ data: T; latencyMs: number; wasCached: boolean }> {
  const startTime = Date.now();
  
  // Try cache first
  const cached = await getCached();
  if (cached) {
    const latencyMs = Date.now() - startTime;
    return { data: cached, latencyMs, wasCached: true };
  }
  
  // Cache miss - go to "database"
  mockDatabaseCallCount++;
  await new Promise(resolve => setTimeout(resolve, mockDatabaseLatencyMs));
  
  // Store in cache
  await setCached(data[0]);
  
  const latencyMs = Date.now() - startTime;
  return { data: data[0], latencyMs, wasCached: false };
}

// Simple in-memory cache for simulation when Redis unavailable
const memoryCache = new Map<string, { data: any; timestamp: number }>();

async function simulatedGet(key: string): Promise<any> {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  
  // Simulate cache latency (much faster than DB)
  await new Promise(resolve => setTimeout(resolve, 1)); 
  return entry.data;
}

async function simulatedSet(key: string, data: any): Promise<void> {
  memoryCache.set(key, { data, timestamp: Date.now() });
  await new Promise(resolve => setTimeout(resolve, 1)); // Simulate Redis write latency
}

// Benchmark results storage
interface BenchmarkResults {
  redisAvailable: boolean;
  cacheHitRate: number;
  avgCacheHitLatencyMs: number;
  avgCacheMissLatencyMs: number;
  databaseCallReduction: number;
  rateLimitBehavior: string;
  cacheStats: any;
  simulationMode: boolean;
}

async function runBenchmark(): Promise<BenchmarkResults> {
  console.log('=== Redis Cache Benchmark ===\n');
  
  // Test 1: Redis availability
  console.log('Test 1: Checking Redis availability...');
  const redis = getRedisClient();
  const redisAvailable = redis !== null;
  console.log(`Redis available: ${redisAvailable}`);
  
  if (!redisAvailable) {
    console.log('⚠️  Redis not available - running in simulation mode only');
  }
  
  await clearAllCache();
  
  // Test 2: Cache hit/miss behavior
  console.log('\nTest 2: Cache hit/miss behavior...');
  const cacheHits: number[] = [];
  const cacheMisses: number[] = [];
  
  const filters = { examCode: 'SSC_CGL', subject: 'Polity', limit: 10 };
  const cacheKey = `questions:${filters.examCode}:${filters.subject}:${filters.limit}`;
  
  if (redisAvailable) {
    // Real Redis test
    let start = Date.now();
    await cacheQuestions(filters, mockQuestions.slice(0, 10));
    cacheMisses.push(Date.now() - start);
    
    start = Date.now();
    const cached = await getCachedQuestions(filters);
    cacheHits.push(Date.now() - start);
    
    start = Date.now();
    await getCachedQuestions(filters);
    cacheHits.push(Date.now() - start);
  } else {
    // Simulated cache test
    memoryCache.clear();
    
    // First call - cache miss
    let start = Date.now();
    await simulatedSet(cacheKey, mockQuestions.slice(0, 10));
    await new Promise(resolve => setTimeout(resolve, mockDatabaseLatencyMs)); // Simulate DB
    cacheMisses.push(Date.now() - start);
    
    // Second call - cache hit
    start = Date.now();
    await simulatedGet(cacheKey);
    cacheHits.push(Date.now() - start);
    
    // Third call - cache hit
    start = Date.now();
    await simulatedGet(cacheKey);
    cacheHits.push(Date.now() - start);
  }
  
  const avgCacheHitLatency = cacheHits.length > 0 
    ? cacheHits.reduce((a, b) => a + b, 0) / cacheHits.length 
    : 0;
  const avgCacheMissLatency = cacheMisses.length > 0 
    ? cacheMisses.reduce((a, b) => a + b, 0) / cacheMisses.length 
    : 0;
  
  console.log(`Cache hits: ${cacheHits.length}, avg latency: ${avgCacheHitLatency.toFixed(2)}ms`);
  console.log(`Cache misses: ${cacheMisses.length}, avg latency: ${avgCacheMissLatency.toFixed(2)}ms`);
  
  // Test 3: Database call reduction
  console.log('\nTest 3: Database call reduction (with mock DB)...');
  
  const iterations = 20;
  let dbCallsWithoutCache = 0;
  let dbCallsWithCache = 0;
  
  // Without cache - every call hits DB
  for (let i = 0; i < iterations; i++) {
    dbCallsWithoutCache++;
    await new Promise(resolve => setTimeout(resolve, mockDatabaseLatencyMs));
  }
  
  // With cache - first call misses, rest hit
  memoryCache.clear();
  for (let i = 0; i < iterations; i++) {
    if (redisAvailable) {
      const cached = await getCachedQuestions(filters);
      if (!cached) {
        dbCallsWithCache++;
        await cacheQuestions(filters, mockQuestions.slice(0, 10));
      }
    } else {
      const cached = await simulatedGet(cacheKey);
      if (!cached) {
        dbCallsWithCache++;
        await new Promise(resolve => setTimeout(resolve, mockDatabaseLatencyMs));
        await simulatedSet(cacheKey, mockQuestions.slice(0, 10));
      }
    }
  }
  
  const dbCallReduction = ((dbCallsWithoutCache - dbCallsWithCache) / dbCallsWithoutCache) * 100;
  
  console.log(`DB calls without cache: ${dbCallsWithoutCache}`);
  console.log(`DB calls with cache: ${dbCallsWithCache}`);
  console.log(`Database call reduction: ${dbCallReduction.toFixed(1)}%`);
  
  // Test 4: Rate limiting
  console.log('\nTest 4: Rate limiting behavior...');
  let rateLimitHits = 0;
  let rateLimitAllowed = 0;
  
  if (redisAvailable) {
    for (let i = 0; i < 15; i++) {
      const result = await checkRateLimit('benchmark-test', 'test-client', 10);
      if (result.allowed) {
        rateLimitAllowed++;
      } else {
        rateLimitHits++;
      }
    }
  } else {
    // Simulated rate limiting using in-memory counter
    const rateLimitWindow = 60 * 1000; // 1 minute
    const maxRequests = 10;
    const requests: number[] = [];
    
    for (let i = 0; i < 15; i++) {
      const now = Date.now();
      // Remove requests outside window
      const validRequests = requests.filter(t => now - t < rateLimitWindow);
      requests.length = 0;
      requests.push(...validRequests);
      
      if (requests.length < maxRequests) {
        requests.push(now);
        rateLimitAllowed++;
      } else {
        rateLimitHits++;
      }
    }
  }
  
  console.log(`Rate limit allowed: ${rateLimitAllowed}, blocked: ${rateLimitHits}`);
  
  // Test 5: Cache statistics
  console.log('\nTest 5: Cache statistics...');
  const stats = await getCacheStats();
  console.log('Cache stats:', JSON.stringify(stats, null, 2));
  
  // Test 6: Exams and Topics caching
  console.log('\nTest 6: Exams and Topics caching...');
  
  if (redisAvailable) {
    await cacheExams(mockExams);
    await cacheTopics(mockTopics, 'Polity');
    
    const examsCached = await getCachedExams();
    const topicsCached = await getCachedTopics('Polity');
    
    console.log(`Exams cached: ${examsCached ? examsCached.length : 0} items`);
    console.log(`Topics cached: ${topicsCached ? topicsCached.length : 0} items`);
  } else {
    await simulatedSet('exams', mockExams);
    await simulatedSet('topics:polity', mockTopics);
    
    const examsCached = await simulatedGet('exams');
    const topicsCached = await simulatedGet('topics:polity');
    
    console.log(`Exams cached: ${examsCached ? examsCached.length : 0} items`);
    console.log(`Topics cached: ${topicsCached ? topicsCached.length : 0} items`);
  }
  
  const finalStats = await getCacheStats();
  
  return {
    redisAvailable,
    cacheHitRate: cacheHits.length / (cacheHits.length + cacheMisses.length),
    avgCacheHitLatencyMs: avgCacheHitLatency,
    avgCacheMissLatencyMs: avgCacheMissLatency,
    databaseCallReduction: dbCallReduction,
    rateLimitBehavior: `Allowed: ${rateLimitAllowed}, Blocked: ${rateLimitHits}`,
    cacheStats: finalStats,
    simulationMode: !redisAvailable,
  };
}

function printResults(results: BenchmarkResults) {
  console.log('\n=== Benchmark Results ===\n');
  
  console.log('📊 REAL MEASURED RESULTS (Redis):');
  console.log(`- Redis Available: ${results.redisAvailable ? '✅ Yes' : '❌ No'}`);
  if (results.redisAvailable) {
    console.log(`- Questions Cache Keys: ${results.cacheStats.questionsKeys}`);
    console.log(`- Exams Cached: ${results.cacheStats.examsCached ? '✅' : '❌'}`);
    console.log(`- Topics Cache Keys: ${results.cacheStats.topicsKeys}`);
  } else {
    console.log('- Running in SIMULATION MODE (Redis not available)');
  }
  
  console.log('\n🎮 CONTROLLED BENCHMARK RESULTS:');
  console.log(`- Mode: ${results.simulationMode ? 'Simulation (in-memory cache)' : 'Real Redis'}`);
  console.log(`- Cache Hit Rate: ${(results.cacheHitRate * 100).toFixed(1)}%`);
  console.log(`- Avg Cache Hit Latency: ${results.avgCacheHitLatencyMs.toFixed(2)}ms`);
  console.log(`- Avg Cache Miss Latency: ${results.avgCacheMissLatencyMs.toFixed(2)}ms`);
  console.log(`- Database Call Reduction: ${results.databaseCallReduction.toFixed(1)}%`);
  console.log(`- Rate Limit Behavior: ${results.rateLimitBehavior}`);
  
  console.log('\n📈 THEORETICAL EXPECTATIONS:');
  console.log(`- Expected Cache Hit Rate: 70-90% (for repeated queries in production)`);
  console.log(`- Expected Latency Improvement: 10-100x faster than DB`);
  console.log(`- Expected DB Call Reduction: 25-50% (for typical workloads)`);
  console.log(`- Rate Limit: Prevents abuse during traffic spikes`);
  
  console.log('\n⚠️  IMPORTANT DISTINCTIONS:');
  console.log('1. REAL RESULTS: Actual Redis performance when available');
  console.log('2. SIMULATION RESULTS: In-memory cache demonstrating expected behavior');
  console.log('3. THEORETICAL: Expected improvements based on architecture patterns');
  
  if (!results.redisAvailable) {
    console.log('\n⚠️  NOTE: Redis not available - results are simulation only');
    console.log('To get REAL measured results, start Redis locally:');
    console.log('  Docker: docker run -d -p 6379:6379 redis:7-alpine');
    console.log('  Windows: Install Redis from https://github.com/microsoftarchive/redis/releases');
    console.log('  Then set REDIS_URL=redis://localhost:6379 in .env.local');
  }
}

// Run the benchmark
async function main() {
  try {
    const results = await runBenchmark();
    printResults(results);
    
    // Clean up
    await clearAllCache();
    process.exit(0);
  } catch (error) {
    console.error('Benchmark failed:', error);
    process.exit(1);
  }
}

main();
