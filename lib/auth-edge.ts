import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const COOKIE_NAME = 'auth-token';

// Convert string secret to Uint8Array for jose
const secret = new TextEncoder().encode(JWT_SECRET);

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

// Edge-compatible JWT creation
export async function createTokenEdge(payload: AuthPayload): Promise<string> {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .setIssuer('pnl-analysis')
    .setAudience('pnl-analysis-users')
    .sign(secret);
}

// Edge-compatible JWT verification
export async function verifyTokenEdge(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'pnl-analysis',
      audience: 'pnl-analysis-users',
    });
    return payload as unknown as AuthPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Edge-compatible token verification for middleware (no database calls)
export async function getTokenPayloadFromRequest(request: NextRequest): Promise<AuthPayload | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifyTokenEdge(token);
  if (!payload) {
    console.error('Invalid token in request');
    return null;
  }

  return payload;
}