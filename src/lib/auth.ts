import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { queryOne } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
}

export interface User {
    id: string;
    email: string;
    nama: string;
    role: string;
    avatar: string | null;
    created_at: Date;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(payload: JwtPayload): string {
    return jwt.sign(payload as object, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

// Verify JWT token
export function verifyToken(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
        return null;
    }
}

// Get token from request
export function getTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}

// Authenticate request and return user
export async function authenticateRequest(request: NextRequest): Promise<User | null> {
    const token = getTokenFromRequest(request);
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const user = await queryOne<User>(
        'SELECT id, email, nama, role, avatar, created_at FROM users WHERE id = ?',
        [payload.userId]
    );

    return user;
}

// Require authentication middleware style
export async function requireAuth(
    request: NextRequest
): Promise<{ user: User } | { error: string; status: number }> {
    const user = await authenticateRequest(request);

    if (!user) {
        return { error: 'Unauthorized', status: 401 };
    }

    return { user };
}

// Require admin role
export async function requireAdmin(
    request: NextRequest
): Promise<{ user: User } | { error: string; status: number }> {
    const result = await requireAuth(request);

    if ('error' in result) {
        return result;
    }

    if (result.user.role !== 'ADMIN') {
        return { error: 'Forbidden: Admin access required', status: 403 };
    }

    return result;
}
