import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { successResponse, errorResponse, generateId } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

// POST /api/v1/upload - Upload file
export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if ('error' in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return errorResponse('File tidak ditemukan', 400);
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            return errorResponse('Tipe file tidak diizinkan. Gunakan: JPG, PNG, GIF, WEBP, SVG', 400);
        }

        // Validate file size (5MB max)
        const maxSize = parseInt(process.env.UPLOAD_MAX_SIZE || '5242880');
        if (file.size > maxSize) {
            return errorResponse(`Ukuran file maksimal ${maxSize / 1024 / 1024}MB`, 400);
        }

        // Generate unique filename
        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `${generateId()}.${ext}`;

        // Create uploads directory if not exists
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });

        // Write file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);

        // Return public URL
        const url = `/uploads/${filename}`;

        return successResponse({
            filename,
            url,
            size: file.size,
            type: file.type,
        }, 'File berhasil diupload');

    } catch (error) {
        console.error('Upload error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
