import { NextRequest } from 'next/server';
import { handleDataRequest } from '@/lib/api-handler';

export async function GET(request: NextRequest) {
  return handleDataRequest(request, '/services/');
}

export async function POST(request: NextRequest) {
  return handleDataRequest(request, '/services/', 'POST');
}