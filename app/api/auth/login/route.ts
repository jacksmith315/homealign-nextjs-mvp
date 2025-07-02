import { NextRequest, NextResponse } from 'next/server';
import { makeAuthRequest } from '@/lib/django-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { database, email, password } = body;

    if (!email || !password || !database) {
      return NextResponse.json(
        { error: 'Databasse, email, and password are required' },
        { status: 400 }
      );
    }

    // Make request to Django /tenant-login/ endpoint (new enhanced endpoint)
    const response = await makeAuthRequest('/tenant-login/', {
      tenant: database,
      email,
      password,
    });

    const { access, refresh } = response.data;

    // Create response with tokens in secure HTTP-only cookies
    const nextResponse = NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    );

    // Set secure HTTP-only cookies
    nextResponse.cookies.set('access_token', access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    nextResponse.cookies.set('refresh_token', refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return nextResponse;
  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}