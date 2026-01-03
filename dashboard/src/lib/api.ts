// API Configuration for Dashboard
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedData<T> {
    items: T[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}

// Get auth token from localStorage
export function getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
}

// Set auth token
export function setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
}

// Remove auth token
export function removeAuthToken(): void {
    localStorage.removeItem('auth_token');
}

// API fetch wrapper with auth
export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = getAuthToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data: ApiResponse<T> = await response.json();

        // Handle auth errors
        if (response.status === 401) {
            removeAuthToken();
            window.location.href = '/signin';
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: 'Gagal terhubung ke server',
        };
    }
}

// GET request
export function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
    return apiFetch<T>(endpoint, { method: 'GET' });
}

// POST request
export function apiPost<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return apiFetch<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

// PUT request
export function apiPut<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return apiFetch<T>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
}

// DELETE request
export function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return apiFetch<T>(endpoint, { method: 'DELETE' });
}

// Upload file
export async function apiUpload(file: File): Promise<ApiResponse<{ url: string; filename: string }>> {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
        });

        return await response.json();
    } catch (error) {
        console.error('Upload Error:', error);
        return {
            success: false,
            error: 'Gagal mengupload file',
        };
    }
}

/**
 * Get full media URL from relative path
 * @param path Relative path (e.g. /uploads/image.jpg)
 * @returns Full URL
 */
export function getMediaUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    // API_BASE_URL is 'http://localhost:3000/api/v1'
    // We want 'http://localhost:3000'
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}
