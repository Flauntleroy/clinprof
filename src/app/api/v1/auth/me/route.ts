import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

// GET /api/v1/auth/me - Get current user
export async function GET(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);

        if ('error' in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        return successResponse({
            user: authResult.user,
        });

    } catch (error) {
        console.error('Auth check error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
