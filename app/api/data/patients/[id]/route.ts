import { NextRequest } from 'next/server';
import { handleDataRequest } from '@/lib/api-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleDataRequest(request, `/patients/${params.id}/`);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleDataRequest(request, `/patients/${params.id}/`, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleDataRequest(request, `/patients/${params.id}/`, 'DELETE');
}