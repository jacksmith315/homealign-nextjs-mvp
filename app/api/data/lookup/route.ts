import { NextRequest } from 'next/server';
import { handleDataRequest } from '@/lib/api-handler';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');

  const endpoints: Record<string, string> = {
    'referral-types': '/referral-types/',
    'referral-status': '/referral-status/',
    'referral-source': '/referral-source/',
    'tenants': '/tenants/',
  };

  if (!type || !endpoints[type]) {
    return new Response(
      JSON.stringify({ error: 'Invalid lookup type' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return handleDataRequest(request, endpoints[type]);
}