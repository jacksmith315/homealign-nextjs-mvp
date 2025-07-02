import { NextRequest, NextResponse } from 'next/server';
import { makeDjangoRequest } from '@/lib/django-api';
import { extractUserFromToken } from '@/lib/jwt-utils';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // First, try to extract user info from the JWT token
    const userFromToken = extractUserFromToken(accessToken);
    console.log('User from token:', userFromToken);
    
    if (userFromToken) {
      return NextResponse.json({
        user: {
          email: userFromToken.email || 'current.user@example.com',
          username: userFromToken.username || 'current_user',
          id: userFromToken.userId || '1',
          role: userFromToken.role || 'User',
        }
      });
    }

    // Fallback: Try to get user info from Django API
    try {
      const userResponse = await makeDjangoRequest('/user/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      return NextResponse.json({
        user: userResponse.data
      });
    } catch (userError: any) {
      // Final fallback: Verify token is valid and return basic info
      try {
        const testResponse = await makeDjangoRequest('/patients/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          params: {
            page: '1',
            page_size: '1'
          }
        });

        // Token is valid, return basic user object
        return NextResponse.json({
          user: {
            email: 'authenticated.user@example.com',
            id: 1,
            username: 'authenticated_user',
            role: 'User'
          }
        });
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
    }
  } catch (error: any) {
    console.error('User info error:', error);
    return NextResponse.json(
      { error: 'Failed to get user information' },
      { status: 500 }
    );
  }
}
