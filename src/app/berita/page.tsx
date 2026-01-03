import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar, Footer } from '@/components/public';
import { query } from '@/lib/db';

interface Berita {
    id: string;
    judul: string;
    slug: string;
    excerpt: string | null;
    thumbnail: string | null;
    kategori_nama: string | null;
    kategori_id: string | null;
    published_at: string | null;
    created_at: string;
}

interface Kategori {
    id: string;
    nama: string;
    slug: string;
}

export const metadata: Metadata = {
    title: 'Berita & Artikel | Klinik Spesialis Mata Makula Bahalap',
    description: 'Dapatkan informasi terbaru seputar kesehatan mata dan aktivitas Klinik Spesialis Mata Makula Bahalap.',
};

async function getBerita(kategori?: string, page = 1, limit = 9) {
    try {
        const offset = (page - 1) * limit;
        let whereClause = 'WHERE b.status = "published" AND (b.published_at IS NULL OR b.published_at <= NOW())';
        const params: (string | number)[] = [];

        if (kategori) {
            whereClause += ' AND b.kategori_id = ?';
            params.push(kategori);
        }

        // Get total count
        const countResult = await query<{ total: number }>(
            `SELECT COUNT(*) as total FROM berita b ${whereClause}`,
            params
        );
        const total = countResult[0]?.total || 0;

        // Get berita
        const berita = await query<Berita>(
            `SELECT b.id, b.judul, b.slug, b.excerpt, b.thumbnail, b.kategori_id, b.published_at, b.created_at, k.nama as kategori_nama
             FROM berita b
             LEFT JOIN kategori_berita k ON b.kategori_id = k.id
             ${whereClause}
             ORDER BY b.created_at DESC
             LIMIT ${limit} OFFSET ${offset}`,
            params
        );

        return {
            items: berita,
            pagination: {
                page,
                totalPages: Math.ceil(total / limit),
                total,
            },
        };
    } catch (error) {
        console.error('Failed to fetch berita:', error);
        return { items: [], pagination: { page: 1, totalPages: 1, total: 0 } };
    }
}

async function getKategori() {
    try {
        const categories = await query<Kategori>(
            'SELECT id, nama, slug FROM kategori_berita ORDER BY nama ASC'
        );
        return categories;
    } catch (error) {
        console.error('Failed to fetch kategori:', error);
        return [];
    }
}

// Helper to validate image URLs
function isValidImageUrl(url: string | null): boolean {
    if (!url) return false;
    return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
}

// Format date helper
function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export default async function BeritaPage({
    searchParams,
}: {
    searchParams: Promise<{ kategori?: string; page?: string }>;
}) {
    const params = await searchParams;
    const kategori = params.kategori;
    const page = parseInt(params.page || '1');

    const [beritaData, categories] = await Promise.all([
        getBerita(kategori, page),
        getKategori(),
    ]);

    const { items: berita, pagination } = beritaData;

    return (
        <>
            <Navbar />
            <main>
                {/* Hero */}
                <section className="relative pt-32 pb-20 bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-dark)] to-[var(--color-primary)]">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/4 right-0 w-96 h-96 bg-[var(--color-accent)]/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[var(--color-accent)]/5 rounded-full blur-3xl"></div>
                    </div>
                    <div className="relative max-w-7xl mx-auto px-4 md:px-8 text-center text-white">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                            <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-pulse"></span>
                            <span className="text-sm font-medium">Informasi Terbaru</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                            Berita & <span className="text-[var(--color-accent)]">Artikel</span>
                        </h1>
                        <p className="text-white/80 max-w-2xl mx-auto text-lg">
                            Dapatkan informasi terbaru seputar kesehatan mata dan aktivitas klinik kami.
                        </p>
                    </div>
                </section>

                {/* Content */}
                <section className="section bg-gradient-to-b from-[var(--color-gray-50)] to-white">
                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        {/* Filter */}
                        <div className="mb-10 flex flex-wrap gap-3 justify-center">
                            <Link
                                href="/berita"
                                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${!kategori
                                    ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/30'
                                    : 'bg-white text-[var(--color-gray-600)] hover:bg-[var(--color-gray-100)] border border-[var(--color-gray-200)]'
                                    }`}
                            >
                                Semua Berita
                            </Link>
                            {categories.map((cat: Kategori) => (
                                <Link
                                    key={cat.id}
                                    href={`/berita?kategori=${cat.id}`}
                                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${kategori === cat.id
                                        ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/30'
                                        : 'bg-white text-[var(--color-gray-600)] hover:bg-[var(--color-gray-100)] border border-[var(--color-gray-200)]'
                                        }`}
                                >
                                    {cat.nama}
                                </Link>
                            ))}
                        </div>

                        {/* Grid */}
                        {berita.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--color-gray-100)] flex items-center justify-center">
                                    <svg className="w-12 h-12 text-[var(--color-gray-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">Belum Ada Berita</h3>
                                <p className="text-[var(--color-gray-500)]">Nantikan informasi terbaru dari kami.</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {berita.map((item: Berita, index: number) => (
                                    <article
                                        key={item.id}
                                        className="group bg-white rounded-2xl overflow-hidden shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-[var(--color-primary)]/10 transition-all duration-500 border border-[var(--color-gray-100)]"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative aspect-[16/10] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] overflow-hidden">
                                            {isValidImageUrl(item.thumbnail) ? (
                                                <Image
                                                    src={item.thumbnail!}
                                                    alt={item.judul}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Category Badge */}
                                            {item.kategori_nama && (
                                                <span className="absolute top-4 left-4 px-3 py-1.5 bg-[var(--color-accent)] text-[var(--color-primary)] text-xs font-bold rounded-full shadow-lg">
                                                    {item.kategori_nama}
                                                </span>
                                            )}
                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            <div className="flex items-center gap-3 mb-3">
                                                <time className="text-sm text-[var(--color-gray-500)] flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {formatDate(item.published_at || item.created_at)}
                                                </time>
                                            </div>
                                            <h3 className="font-bold text-lg text-[var(--color-primary)] mb-3 line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors duration-300">
                                                <Link href={`/berita/${item.slug}`}>
                                                    {item.judul}
                                                </Link>
                                            </h3>
                                            {item.excerpt && (
                                                <p className="text-[var(--color-gray-600)] text-sm line-clamp-2 mb-4">
                                                    {item.excerpt}
                                                </p>
                                            )}
                                            <Link
                                                href={`/berita/${item.slug}`}
                                                className="inline-flex items-center gap-2 text-[var(--color-primary)] font-semibold text-sm group/link"
                                            >
                                                Baca Selengkapnya
                                                <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="mt-16 flex justify-center items-center gap-4">
                                {page > 1 && (
                                    <Link
                                        href={`/berita?${kategori ? `kategori=${kategori}&` : ''}page=${page - 1}`}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-xl text-[var(--color-gray-600)] hover:bg-[var(--color-gray-50)] transition border border-[var(--color-gray-200)] font-medium"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Sebelumnya
                                    </Link>
                                )}
                                <div className="flex items-center gap-2">
                                    <span className="px-5 py-3 bg-[var(--color-primary)] text-white rounded-xl font-bold shadow-lg shadow-[var(--color-primary)]/30">
                                        {page}
                                    </span>
                                    <span className="text-[var(--color-gray-400)]">dari</span>
                                    <span className="px-4 py-2 bg-[var(--color-gray-100)] text-[var(--color-gray-600)] rounded-lg font-medium">
                                        {pagination.totalPages}
                                    </span>
                                </div>
                                {page < pagination.totalPages && (
                                    <Link
                                        href={`/berita?${kategori ? `kategori=${kategori}&` : ''}page=${page + 1}`}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-xl text-[var(--color-gray-600)] hover:bg-[var(--color-gray-50)] transition border border-[var(--color-gray-200)] font-medium"
                                    >
                                        Selanjutnya
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
