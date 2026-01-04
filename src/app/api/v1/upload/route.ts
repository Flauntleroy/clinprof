import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { successResponse, errorResponse, generateId } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

// Magic bytes for common image formats
const MAGIC_BYTES: Record<string, number[][]> = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header (WebP starts with RIFF)
};

// Validate file magic bytes
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
    const signatures = MAGIC_BYTES[mimeType];
    if (!signatures) {
        // SVG doesn't have magic bytes, check for XML/SVG content
        if (mimeType === 'image/svg+xml') {
            const content = buffer.toString('utf8', 0, 100).toLowerCase();
            return content.includes('<svg') || content.includes('<?xml');
        }
        return false;
    }

    return signatures.some(signature =>
        signature.every((byte, index) => buffer[index] === byte)
    );
}

// Sanitize filename to prevent path traversal
function sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}

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

        // Validate file type (MIME)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            return errorResponse('Tipe file tidak diizinkan. Gunakan: JPG, PNG, GIF, WEBP, SVG', 400);
        }

        // Validate file size (20MB max)
        const maxSize = parseInt(process.env.UPLOAD_MAX_SIZE || '20971520');
        if (file.size > maxSize) {
            return errorResponse(`Ukuran file maksimal ${maxSize / 1024 / 1024}MB`, 400);
        }

        // Get file bytes
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Validate magic bytes (actual file content)
        if (!validateMagicBytes(buffer, file.type)) {
            console.warn(`File upload rejected: magic bytes mismatch for ${file.name} (claimed: ${file.type})`);
            return errorResponse('File tidak valid. Pastikan file adalah gambar yang benar.', 400);
        }

        // Generate safe unique filename
        const safeExt = sanitizeFilename(file.name.split('.').pop() || 'jpg').substring(0, 10);
        const filename = `${generateId()}.${safeExt}`;

        // Create uploads directory if not exists
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });

        // Write file
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

