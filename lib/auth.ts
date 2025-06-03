import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { getUserById, getUserByEmail } from "./db";
import type { User } from "./schema";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-change-this-in-production";
const COOKIE_NAME = "auth-token";
const SALT_ROUNDS = 12;

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// JWT utilities
export function createToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
    issuer: "pnl-analysis",
    audience: "pnl-analysis-users",
  });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "pnl-analysis",
      audience: "pnl-analysis-users",
    }) as AuthPayload;
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

// Edge-compatible JWT verification for server-side API routes
export async function verifyTokenEdgeCompat(
  token: string,
): Promise<AuthPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      issuer: "pnl-analysis",
      audience: "pnl-analysis-users",
    });
    return payload as unknown as AuthPayload;
  } catch (error) {
    console.error("Edge JWT verification failed:", error);
    return null;
  }
}

// Cookie utilities
export function setAuthCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
}

export function clearAuthCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function getAuthToken(): string | null {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME);
  return token?.value || null;
}

// Authentication functions
export async function authenticate(
  credentials: LoginCredentials,
): Promise<{ user: User; token: string } | null> {
  const user = await getUserByEmail(credentials.email);

  if (!user || !user.isActive) {
    return null;
  }

  const isValid = await verifyPassword(credentials.password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  const payload: AuthPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const token = createToken(payload);
  return { user, token };
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getAuthToken();
  if (!token) return null;

  // Try edge-compatible verification first (for tokens created with jose)
  let payload = await verifyTokenEdgeCompat(token);

  // Fallback to old JWT verification (for backward compatibility)
  if (!payload) {
    payload = verifyToken(token);
  }

  if (!payload) return null;

  const user = await getUserById(payload.userId);
  if (!user || !user.isActive) return null;

  return user;
}

export async function getCurrentUserFromRequest(
  request: NextRequest,
): Promise<User | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  // Try edge-compatible verification first (for tokens created with jose)
  let payload = await verifyTokenEdgeCompat(token);

  // Fallback to old JWT verification (for backward compatibility)
  if (!payload) {
    payload = verifyToken(token);
  }

  if (!payload) {
    console.error("Invalid token in request");
    return null;
  }

  const user = await getUserById(payload.userId);
  if (!user || !user.isActive) return null;

  return user;
}

export function isAdmin(user: User): boolean {
  return user.role === "admin";
}

export function canAccessAdminPanel(user: User | null): boolean {
  return user !== null && isAdmin(user);
}

// Password validation
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
