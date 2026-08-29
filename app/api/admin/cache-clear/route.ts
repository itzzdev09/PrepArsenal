// PrepArsenal — Redis Cache Clear API
// Admin endpoint to clear all PYQ cache (emergency use)

import { NextResponse } from 'next/server';
import { clearAllCache } from '@/lib/cache/redis-cache';

export async function POST() {
  try {
    await clearAllCache();
    
    return NextResponse.json({
      success: true,
      message: 'All PYQ cache cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear cache',
      },
      { status: 500 }
    );
  }
}
