import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;
    const selectedDb = request.cookies.get('selected_db')?.value || 'allyalign';

    const isAuthenticated = !!(accessToken && refreshToken);

    return NextResponse.json({
      isAuthenticated,
      selectedDb,
      hasTokens: {
        access: !!accessToken,
        refresh: !!refreshToken,
      }
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({
      isAuthenticated: false,
      selectedDb: 'allyalign',
      hasTokens: {
        access: false,
        refresh: false,
      }
    });
  }
}