import { NextRequest } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { successResponse, errorResponse, validateRequired, generateId } from '@/lib/api';
import { hashPassword, generateToken } from '@/lib/auth';

interface RegisterBody {
    email: string;
    password: string;
    nama: string;
}

interface User {
    id: string;
    email: string;
}

// POST /api/v1/auth/register
export async function POST(request: NextRequest) {
    try {
        const body: RegisterBody = await request.json();

        // Validate required fields
        const validation = validateRequired(body, ['email', 'password', 'nama']);
        if (!validation.valid) {
            return errorResponse(`Field required: ${validation.missing.join(', ')}`, 400);
        }

        // Check if email exists
        const existingUser = await queryOne<User>(
            'SELECT id FROM users WHERE email = ?',
            [body.email]
        );

        if (existingUser) {
            return errorResponse('Email sudah terdaftar', 400);
        }

        // Hash password
        const hashedPassword = await hashPassword(body.password);

        // Create user
        const id = generateId();
        await execute(
            'INSERT INTO users (id, email, password, nama, role) VALUES (?, ?, ?, ?, ?)',
            [id, body.email, hashedPassword, body.nama, 'ADMIN']
        );

        // Generate token
        const token = generateToken({
            userId: id,
            email: body.email,
            role: 'ADMIN',
        });

        return successResponse({
            token,
            user: {
                id,
                email: body.email,
                nama: body.nama,
                role: 'ADMIN',
            },
        }, 'Registrasi berhasil');

    } catch (error) {
        console.error('Register error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
