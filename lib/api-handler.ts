import { NextRequest, NextResponse } from 'next/server';
import { makeDjangoRequest } from '@/lib/django-api';

// Helper function to get auth headers from request cookies
function getAuthHeaders(request: NextRequest): Record<string, string> {
  const accessToken = request.cookies.get('access_token')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return headers;
}

// Helper function to handle API requests with error handling
export async function handleDataRequest(
  request: NextRequest,
  endpoint: string,
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
) {
  try {
    const headers = getAuthHeaders(request);
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    
    // Add database selection as query parameter
    const selectedDb = request.cookies.get('selected_db')?.value || 'allyalign';
    params.db = selectedDb;

    let data;
    if (method === 'POST' || method === 'PUT') {
      try {
        data = await request.json();
      } catch {
        data = undefined;
      }
    }

    const response = await makeDjangoRequest(endpoint, {
      method: method || (request.method as any),
      headers,
      params,
      data,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error(`API Error for ${endpoint}:`, error);

    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error.response?.status === 403) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: 'API request failed',
        detail: error.response?.data?.detail || error.message
      },
      { status: error.response?.status || 500 }
    );
  }
}