import { NextRequest, NextResponse } from 'next/server';
import { makeAuthRequest } from '@/lib/django-api';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token available' },
        { status: 401 }
      );
    }

    // Make request to Django /tenant-refresh/ endpoint
    const response = await makeAuthRequest('/tenant-refresh/', {
      refresh: refreshToken,
    });

    const { access } = response.data;

    // Create response with new access token
    const nextResponse = NextResponse.json(
      { success: true, message: 'Token refreshed' },
      { status: 200 }
    );

    // Update access token cookie
    nextResponse.cookies.set('access_token', access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    return nextResponse;
  } catch (error: any) {
    console.error('Token refresh error:', error);
    
    // If refresh fails, clear all auth cookies
    const response = NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 401 }
    );

    response.cookies.set('access_token', '', { maxAge: 0, path: '/' });
    response.cookies.set('refresh_token', '', { maxAge: 0, path: '/' });

    return response;
  }
}