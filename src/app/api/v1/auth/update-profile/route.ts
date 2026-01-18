import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { execute } from '@/lib/db';

// PUT /api/v1/auth/update-profile - Update user profile
export async function PUT(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);

        if ('error' in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const { user } = authResult;
        const body = await request.json();
        const { nama, email } = body;

        // Validate input
        if (!nama || !email) {
            return errorResponse('Nama dan email harus diisi', 400);
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return errorResponse('Format email tidak valid', 400);
        }

        // Update user in database
        await execute(
            'UPDATE users SET nama = ?, email = ? WHERE id = ?',
            [nama, email, user.id]
        );

        return successResponse({
            message: 'Profil berhasil diperbarui',
            user: {
                ...user,
                nama,
                email,
            },
        });

    } catch (error) {
        console.error('Update profile error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
