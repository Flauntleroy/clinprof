import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar, Footer } from '@/components/public';
import { query, queryOne, execute } from '@/lib/db';

interface Berita {
    id: string;
    judul: string;
    slug: string;
    excerpt: string | null;
    konten: string | null;
    thumbnail: string | null;
    kategori_nama: string | null;
    kategori_id: string | null;
    author_nama: string | null;
    views: number;
    published_at: string | null;
    created_at: string;
    meta_title: string | null;
    meta_description: string | null;
}

async function getBerita(slug: string, incrementView = false) {
    try {
        const berita = await queryOne<Berita>(
            `SELECT b.*, k.nama as kategori_nama, u.nama as author_nama
             FROM berita b
             LEFT JOIN kategori_berita k ON b.kategori_id = k.id
             LEFT JOIN users u ON b.author_id = u.id
             WHERE b.slug = ? AND b.status = 'published'`,
            [slug]
        );

        if (berita && incrementView) {
            await execute('UPDATE berita SET views = views + 1 WHERE id = ?', [berita.id]);
        }

        return berita;
    } catch (error) {
        console.error('Failed to fetch berita:', error);
        return null;
    }
}

// Helper to validate image URLs
function isValidImageUrl(url: string | null): boolean {
    if (!url) return false;
    return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
}

async function getRelatedBerita(kategoriId: string | null, excludeId: string) {
    try {
        let whereClause = 'WHERE b.status = "published" AND b.id != ?';
        const params: string[] = [excludeId];

        if (kategoriId) {
            whereClause += ' AND b.kategori_id = ?';
            params.push(kategoriId);
        }

        const related = await query<Berita>(
            `SELECT b.id, b.judul, b.slug, b.thumbnail, k.nama as kategori_nama
             FROM berita b
             LEFT JOIN kategori_berita k ON b.kategori_id = k.id
             ${whereClause}
             ORDER BY b.created_at DESC
             LIMIT 3`,
            params
        );

        return related;
    } catch (error) {
        console.error('Failed to fetch related berita:', error);
        return [];
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const berita = await getBerita(slug);

    if (!berita) {
        return {
            title: 'Berita Tidak Ditemukan',
        };
    }

    return {
        title: berita.meta_title || `${berita.judul} | Klinik Spesialis Mata Makula Bahalap`,
        description: berita.meta_description || berita.excerpt || 'Baca artikel dari Klinik Spesialis Mata Makula Bahalap.',
        openGraph: {
            title: berita.meta_title || berita.judul,
            description: berita.meta_description || berita.excerpt || '',
            images: berita.thumbnail ? [berita.thumbnail] : [],
        },
    };
}

export default async function BeritaDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const berita = await getBerita(slug, true); // increment view

    if (!berita) {
        notFound();
    }

    const relatedBerita = await getRelatedBerita(berita.kategori_id, berita.id);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <>
            <Navbar />
            <main>
                {/* Hero with Thumbnail */}
                <section className="relative pt-24 pb-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)]">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/4 right-0 w-96 h-96 bg-[var(--color-accent)]/10 rounded-full blur-3xl"></div>
                    </div>
                    <div className="relative max-w-4xl mx-auto px-4 md:px-8 text-white">
                        {/* Breadcrumb */}
                        <nav className="mb-6 text-white/70 text-sm">
                            <Link href="/" className="hover:text-white">Beranda</Link>
                            <span className="mx-2">/</span>
                            <Link href="/berita" className="hover:text-white">Berita</Link>
                            <span className="mx-2">/</span>
                            <span className="text-white">{berita.judul}</span>
                        </nav>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-white/80">
                            {berita.kategori_nama && (
                                <span className="px-3 py-1 bg-[var(--color-accent)] text-[var(--color-primary)] rounded-full font-medium">
                                    {berita.kategori_nama}
                                </span>
                            )}
                            <span>{formatDate(berita.published_at || berita.created_at)}</span>
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {berita.views} views
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                            {berita.judul}
                        </h1>
                    </div>
                </section>

                {/* Featured Image */}
                {isValidImageUrl(berita.thumbnail) && (
                    <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-8">
                        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                                src={berita.thumbnail!}
                                alt={berita.judul}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>
                )}

                {/* Content */}
                <section className="section">
                    <div className="max-w-4xl mx-auto px-4 md:px-8">
                        <div className="grid lg:grid-cols-4 gap-8">
                            {/* Main Content */}
                            <article className="lg:col-span-3">
                                {berita.excerpt && (
                                    <p className="text-xl text-[var(--color-gray-600)] mb-8 font-medium leading-relaxed">
                                        {berita.excerpt}
                                    </p>
                                )}

                                {berita.konten && (
                                    <div
                                        className="prose prose-lg max-w-none prose-headings:text-[var(--color-primary)] prose-a:text-[var(--color-accent)] prose-img:rounded-xl break-words overflow-hidden [&_*]:break-words [&_*]:overflow-wrap-anywhere"
                                        dangerouslySetInnerHTML={{ __html: berita.konten }}
                                    />
                                )}

                                {/* Share Buttons */}
                                <div className="mt-12 pt-8 border-t border-[var(--color-gray-200)]">
                                    <h4 className="font-medium text-[var(--color-primary)] mb-4">Bagikan Artikel</h4>
                                    <div className="flex gap-3">
                                        <a
                                            href={`https://wa.me/?text=${encodeURIComponent(berita.judul)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                        </a>
                                        <a
                                            href="#"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                            </svg>
                                        </a>
                                        <a
                                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(berita.judul)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </article>

                            {/* Sidebar */}
                            <aside className="lg:col-span-1">
                                {berita.author_nama && (
                                    <div className="mb-8 p-4 bg-[var(--color-gray-50)] rounded-xl">
                                        <p className="text-sm text-[var(--color-gray-500)]">Penulis</p>
                                        <p className="font-medium text-[var(--color-primary)]">{berita.author_nama}</p>
                                    </div>
                                )}
                            </aside>
                        </div>
                    </div>
                </section>

                {/* Related Posts */}
                {relatedBerita.length > 0 && (
                    <section className="section bg-[var(--color-gray-50)]">
                        <div className="max-w-7xl mx-auto px-4 md:px-8">
                            <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-8">Artikel Terkait</h2>
                            <div className="grid md:grid-cols-3 gap-8">
                                {relatedBerita.map((item: Berita) => (
                                    <article key={item.id} className="card group overflow-hidden">
                                        <div className="relative aspect-video bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)]">
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
                                        </div>
                                        <div className="p-6">
                                            <h3 className="font-bold text-[var(--color-primary)] line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
                                                <Link href={`/berita/${item.slug}`}>
                                                    {item.judul}
                                                </Link>
                                            </h3>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>
            <Footer />
        </>
    );
}
