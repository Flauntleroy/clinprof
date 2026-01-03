import { NextRequest } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { successResponse, errorResponse, generateId } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

interface KontenWebsite {
    id: string;
    kunci: string;
    nilai: Record<string, unknown>;
    updated_at: Date;
}

// GET /api/v1/konten - Get all content or specific key
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const kunci = url.searchParams.get('kunci');

        if (kunci) {
            const content = await queryOne<KontenWebsite>(
                'SELECT * FROM konten_website WHERE kunci = ?',
                [kunci]
            );

            if (!content) {
                return errorResponse('Konten tidak ditemukan', 404);
            }

            // Parse JSON value
            const nilai = typeof content.nilai === 'string'
                ? JSON.parse(content.nilai)
                : content.nilai;

            return successResponse({ ...content, nilai });
        }

        // Get all content
        const contents = await query<KontenWebsite>('SELECT * FROM konten_website ORDER BY kunci');

        // Parse JSON values
        const parsedContents = contents.map(c => ({
            ...c,
            nilai: typeof c.nilai === 'string' ? JSON.parse(c.nilai) : c.nilai,
        }));

        return successResponse(parsedContents);

    } catch (error) {
        console.error('Get content error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}

// PUT /api/v1/konten - Update content (upsert)
export async function PUT(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if ('error' in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const body: { kunci: string; nilai: Record<string, unknown> } = await request.json();

        if (!body.kunci || !body.nilai) {
            return errorResponse('kunci dan nilai wajib diisi', 400);
        }

        // Check if exists
        const existing = await queryOne<KontenWebsite>(
            'SELECT id FROM konten_website WHERE kunci = ?',
            [body.kunci]
        );

        const nilaiJson = JSON.stringify(body.nilai);

        if (existing) {
            await execute(
                'UPDATE konten_website SET nilai = ? WHERE kunci = ?',
                [nilaiJson, body.kunci]
            );
        } else {
            const id = generateId();
            await execute(
                'INSERT INTO konten_website (id, kunci, nilai) VALUES (?, ?, ?)',
                [id, body.kunci, nilaiJson]
            );
        }

        return successResponse({ kunci: body.kunci }, 'Konten berhasil disimpan');

    } catch (error) {
        console.error('Update content error:', error);
        return errorResponse('Terjadi kesalahan server', 500);
    }
}
