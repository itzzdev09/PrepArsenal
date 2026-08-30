// PrepArsenal — Redis Cache Statistics API
// Admin endpoint to monitor cache performance and hit rates

import { NextResponse } from 'next/server';
import { getCacheStats } from '@/lib/cache/redis-cache';

export async function GET() {
  try {
    const stats = await getCacheStats();
    
    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cache statistics',
      },
      { status: 500 }
    );
  }
}
