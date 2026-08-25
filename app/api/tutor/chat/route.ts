import { NextResponse } from 'next/server';
import { chat, type ChatMessage } from '@/lib/llm';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const messages: ChatMessage[] | undefined = body?.messages;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
  }

  const response = await chat(messages);
  return NextResponse.json(response);
}
