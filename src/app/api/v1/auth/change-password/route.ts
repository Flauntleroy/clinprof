import { NextRequest } from 'next/server';
import { requireAuth, verifyPassword, hashPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { execute, queryOne } from '@/lib/db';

interface UserWithPassword {
    id: string;
    password: string;
}

// PUT /api/v1/auth/change-password - Change user password
export async function PUT(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);

        if ('error' in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const { user } = authResult;
        const body = await request.json();
        const { currentPassword, newPassword, confirmPassword } = body;

        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return errorResponse('Semua field harus diisi', 400);
        }

        if (newPassword !== confirmPassword) {
            return errorResponse('Password baru dan konfirmasi tidak cocok', 400);
        }

        if (newPassword.length < 6) {
            return errorResponse('Password baru minimal 6 karakter', 400);
        }

        // Get user with password from database
        const userWithPassword = await queryOne<UserWithPassword>(
            'SELECT id, password FROM users WHERE id = ?',
            [user.id]
        );

        if (!userWithPassword) {
            return errorResponse('User tidak ditemukan', 404);
        }

        // Verify current password
        const isPasswordValid = await verifyPassword(currentPassword, userWithPassword.password);
        if (!isPasswordValid) {
            return errorResponse('Password saat ini salah', 400);
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password in database
        await execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, user.id]
        );

        return successResponse({
            message: 'Password berhasil diubah',
        });

    } catch (error) {
        console.error('Change password error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
