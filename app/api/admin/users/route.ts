import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This route uses the SERVICE ROLE key to bypass RLS for admin operations
// that need to modify restricted columns (role, status).
// The route itself verifies the caller is an admin before proceeding.

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase service-role configuration');
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function verifyAdmin(request: NextRequest): Promise<{ isAdmin: boolean; adminId: string | null }> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return { isAdmin: false, adminId: null };

  const token = authHeader.replace('Bearer ', '');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return { isAdmin: false, adminId: null };

  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return { isAdmin: false, adminId: null };

  // Check role using the service client (bypasses RLS)
  const serviceClient = getServiceClient();
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') return { isAdmin: false, adminId: null };

  return { isAdmin: true, adminId: user.id };
}

// GET /api/admin/users — Fetch all users with aggregated metrics
export async function GET(request: NextRequest) {
  const { isAdmin } = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const serviceClient = getServiceClient();

  // Fetch all profiles
  const { data: profiles, error } = await serviceClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // For each user, get question review counts
  const enrichedProfiles = await Promise.all(
    (profiles || []).map(async (profile) => {
      const examDates = (profile.exam_dates as Record<string, any>) || {};

      // Count total reviews and correct reviews
      const { count: totalReviews } = await serviceClient
        .from('user_question_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id);

      const { count: correctReviews } = await serviceClient
        .from('user_question_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('is_correct', true);

      return {
        id: profile.id,
        full_name: profile.full_name || 'Aspirant',
        email: examDates.email || null,
        phone_number: examDates.phone_number || '',
        target_exams: profile.target_exams || ['SSC_CGL'],
        streak_count: profile.streak_count || 0,
        last_study_date: profile.last_study_date,
        total_study_minutes: profile.total_study_minutes || 0,
        xp: examDates.xp || 0,
        current_level: examDates.current_level || 1,
        role: profile.role || 'user',
        status: profile.status || 'active',
        created_at: profile.created_at,
        questions_attempted: totalReviews || 0,
        accuracy: totalReviews && totalReviews > 0
          ? Math.round(((correctReviews || 0) / totalReviews) * 100)
          : 0,
      };
    })
  );

  return NextResponse.json({ users: enrichedProfiles });
}

// PATCH /api/admin/users — Update user role or status (service-role bypass)
export async function PATCH(request: NextRequest) {
  const { isAdmin, adminId } = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { userId, action, value } = body;

  if (!userId || !action) {
    return NextResponse.json({ error: 'Missing userId or action' }, { status: 400 });
  }

  const serviceClient = getServiceClient();

  switch (action) {
    case 'change_role': {
      if (!['user', 'admin'].includes(value)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      // Prevent self-demotion
      if (userId === adminId && value !== 'admin') {
        return NextResponse.json({ error: 'Cannot demote yourself' }, { status: 400 });
      }
      const { error } = await serviceClient
        .from('profiles')
        .update({ role: value })
        .eq('id', userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, message: `Role changed to ${value}` });
    }

    case 'change_status': {
      if (!['active', 'suspended'].includes(value)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      // Prevent self-suspension
      if (userId === adminId) {
        return NextResponse.json({ error: 'Cannot suspend yourself' }, { status: 400 });
      }
      const { error } = await serviceClient
        .from('profiles')
        .update({ status: value })
        .eq('id', userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, message: `Status changed to ${value}` });
    }

    case 'reset_streak': {
      const { error } = await serviceClient
        .from('profiles')
        .update({ streak_count: 0, last_study_date: null })
        .eq('id', userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, message: 'Streak reset' });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
