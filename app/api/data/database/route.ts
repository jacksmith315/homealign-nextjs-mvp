import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { selectedDb } = body;

    if (!selectedDb) {
      return NextResponse.json(
        { error: 'Database selection required' },
        { status: 400 }
      );
    }

    const response = NextResponse.json(
      { success: true, selectedDb },
      { status: 200 }
    );

    // Set database selection cookie
    response.cookies.set('selected_db', selectedDb, {
      httpOnly: false, // Allow client-side access for this cookie
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Database selection error:', error);
    return NextResponse.json(
      { error: 'Failed to set database' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const selectedDb = request.cookies.get('selected_db')?.value || 'allyalign';
  
  return NextResponse.json({
    selectedDb,
  });
}