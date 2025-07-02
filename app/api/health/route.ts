import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check database connectivity by trying to get session info
    const sessionResponse = await fetch(`${request.nextUrl.origin}/api/auth/session`);
    const databaseConnected = sessionResponse.ok;

    // Check Django API connectivity
    const djangoApiUrl = process.env.DJANGO_API_URL;
    let djangoApiConnected = false;
    
    if (djangoApiUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const djangoResponse = await fetch(`${djangoApiUrl}/ping`, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        djangoApiConnected = djangoResponse.ok;
      } catch {
        djangoApiConnected = false;
      }
    }

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV,
      checks: {
        nextjs: true,
        database: databaseConnected,
        djangoApi: djangoApiConnected,
      },
    };

    // Determine overall health status
    const allChecksPass = Object.values(health.checks).every(check => check === true);
    health.status = allChecksPass ? 'healthy' : 'degraded';

    return NextResponse.json(health, {
      status: allChecksPass ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}