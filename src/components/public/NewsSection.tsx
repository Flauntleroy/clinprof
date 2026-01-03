'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Berita {
    id: string;
    judul: string;
    slug: string;
    excerpt: string | null;
    thumbnail: string | null;
    kategori_nama: string | null;
    published_at: string | null;
    created_at: string;
}

export default function NewsSection() {
    const [berita, setBerita] = useState<Berita[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBerita = async () => {
            try {
                const response = await fetch('/api/v1/berita?public=true&limit=3');
                const data = await response.json();
                if (data.success && data.data?.items) {
                    setBerita(data.data.items);
                }
            } catch (error) {
                console.error('Failed to fetch berita:', error);
            }
            setLoading(false);
        };
        fetchBerita();
    }, []);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    // Helper to validate image URLs
    const isValidImageUrl = (url: string | null): boolean => {
        if (!url) return false;
        return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
    };

    if (loading) {
        return (
            <section className="section bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (berita.length === 0) {
        return null; // Don't show section if no berita
    }

    return (
        <section id="berita" className="section bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-[var(--color-primary)]/10 rounded-full px-4 py-2 mb-4">
                        <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full"></span>
                        <span className="text-sm font-medium text-[var(--color-primary)]">Berita Terbaru</span>
                    </div>
                    <h2 className="section-title text-[var(--color-primary)]">
                        Artikel & <span className="text-[var(--color-accent)]">Informasi</span>
                    </h2>
                    <p className="section-subtitle">
                        Dapatkan informasi terbaru seputar kesehatan mata dan aktivitas klinik kami.
                    </p>
                </div>

                {/* News Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {berita.map((item) => (
                        <article key={item.id} className="card group overflow-hidden">
                            {/* Thumbnail */}
                            <div className="relative aspect-video bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] overflow-hidden">
                                {isValidImageUrl(item.thumbnail) ? (
                                    <Image
                                        src={item.thumbnail!}
                                        alt={item.judul}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                        </svg>
                                    </div>
                                )}
                                {item.kategori_nama && (
                                    <span className="absolute top-4 left-4 px-3 py-1 bg-[var(--color-accent)] text-[var(--color-primary)] text-xs font-medium rounded-full">
                                        {item.kategori_nama}
                                    </span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <time className="text-sm text-[var(--color-gray-500)] mb-2 block">
                                    {formatDate(item.published_at || item.created_at)}
                                </time>
                                <h3 className="font-bold text-lg text-[var(--color-primary)] mb-3 line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
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
                                    className="inline-flex items-center gap-2 text-[var(--color-primary)] font-medium text-sm hover:text-[var(--color-accent)] transition-colors"
                                >
                                    Baca Selengkapnya
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>

                {/* View All Link */}
                <div className="text-center mt-12">
                    <Link
                        href="/berita"
                        className="btn btn-outline-primary"
                    >
                        Lihat Semua Berita
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
