import { NextRequest, NextResponse } from 'next/server';
import { authenticate, setAuthCookie, validateEmail, createToken } from '@/lib/auth';
import { createTokenEdge } from '@/lib/auth-edge';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Authenticate user
    const result = await authenticate({ email, password });

    if (!result) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create edge-compatible token for middleware
    const edgeToken = await createTokenEdge({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role
    });

    // Set authentication cookie
    const response = NextResponse.json(
      { 
        message: 'Login successful',
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          firstName: result.user.firstName,
          lastName: result.user.lastName
        }
      },
      { status: 200 }
    );

    // Set the auth cookie with edge-compatible token
    response.cookies.set('auth-token', edgeToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}