import { NextResponse } from 'next/server';

// Standard API response format
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// Success response
export function successResponse<T>(data: T, message?: string, status: number = 200): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
        {
            success: true,
            data,
            message,
        },
        { status }
    );
}

// Error response
export function errorResponse(
    error: string,
    status: number = 400
): NextResponse<ApiResponse> {
    return NextResponse.json(
        {
            success: false,
            error,
        },
        { status }
    );
}

// Paginated response
export interface PaginatedData<T> {
    items: T[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}

export function paginatedResponse<T>(
    items: T[],
    total: number,
    page: number,
    perPage: number
): NextResponse<ApiResponse<PaginatedData<T>>> {
    return successResponse({
        items,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
    });
}

// Parse pagination params from URL
export function getPaginationParams(url: URL): { page: number; perPage: number; offset: number } {
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const perPage = Math.min(100, Math.max(1, parseInt(url.searchParams.get('perPage') || '10')));
    const offset = (page - 1) * perPage;
    return { page, perPage, offset };
}

// Generate UUID
export function generateId(): string {
    return crypto.randomUUID();
}

// Validate required fields
export function validateRequired<T extends object>(
    data: T,
    fields: (keyof T)[]
): { valid: boolean; missing: string[] } {
    const missing = fields.filter(
        (field) => data[field] === undefined || data[field] === null || data[field] === ''
    );
    return {
        valid: missing.length === 0,
        missing: missing.map(f => String(f)),
    };
}
