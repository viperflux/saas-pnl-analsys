import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const cookies = request.cookies.getAll();
  const authToken = request.cookies.get('auth-token');
  
  return NextResponse.json({
    message: 'Cookie debug info',
    allCookies: cookies,
    authToken: authToken?.value || 'not found',
    userAgent: request.headers.get('user-agent'),
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    message: 'Test cookie set',
    timestamp: new Date().toISOString()
  });

  response.cookies.set('test-cookie', 'test-value', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 3600,
    path: '/'
  });

  return response;
}