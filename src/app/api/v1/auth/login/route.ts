import { NextRequest } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { successResponse, errorResponse, validateRequired, generateId } from '@/lib/api';
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth';

interface LoginBody {
    email: string;
    password: string;
}

interface RegisterBody {
    email: string;
    password: string;
    nama: string;
}

interface User {
    id: string;
    email: string;
    password: string;
    nama: string;
    role: string;
    avatar: string | null;
}

// POST /api/v1/auth/login
export async function POST(request: NextRequest) {
    try {
        const body: LoginBody = await request.json();

        // Validate required fields
        const validation = validateRequired(body, ['email', 'password']);
        if (!validation.valid) {
            return errorResponse(`Field required: ${validation.missing.join(', ')}`, 400);
        }

        // Find user by email
        const user = await queryOne<User>(
            'SELECT * FROM users WHERE email = ?',
            [body.email]
        );

        if (!user) {
            return errorResponse('Email atau password salah', 401);
        }

        // Verify password
        const isValid = await verifyPassword(body.password, user.password);
        if (!isValid) {
            return errorResponse('Email atau password salah', 401);
        }

        // Generate token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return successResponse({
            token,
            user: {
                id: user.id,
                email: user.email,
                nama: user.nama,
                role: user.role,
                avatar: user.avatar,
            },
        }, 'Login berhasil');

    } catch (error) {
        console.error('Login error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
