import { Navbar, Footer } from '@/components/public';
import { Metadata } from 'next';
import Image from 'next/image';
import { query } from '@/lib/db';

export const metadata: Metadata = {
    title: 'Layanan | Klinik Spesialis Mata Makula Bahalap',
    description: 'Layanan lengkap pemeriksaan dan perawatan mata di Klinik Makula Bahalap.',
};

interface Layanan {
    id: string;
    nama: string;
    deskripsi: string;
    icon: string;
    gambar: string;
}

async function getLayanan(): Promise<Layanan[]> {
    try {
        const layanan = await query<Layanan>(
            'SELECT id, nama, deskripsi, icon, gambar FROM layanan WHERE is_active = 1 ORDER BY urutan, nama'
        );
        return layanan;
    } catch (error) {
        console.error('Failed to fetch layanan:', error);
        return [];
    }
}

export default async function LayananPage() {
    const layanan = await getLayanan();

    return (
        <>
            <Navbar />
            <main className="min-h-screen">
                {/* Hero Section */}
                <section className="relative pt-28 pb-16 overflow-hidden">
                    <div className="absolute inset-0 gradient-hero opacity-95"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-accent)]/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-2xl"></div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                            <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-pulse"></span>
                            <span className="text-sm font-medium">Pelayanan</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Layanan <span className="text-[var(--color-accent)]">Kami</span>
                        </h1>
                        <p className="text-lg text-white/80 max-w-2xl mx-auto">
                            Berbagai layanan pemeriksaan dan perawatan mata dengan teknologi modern dan tenaga ahli berpengalaman.
                        </p>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {layanan.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {layanan.map((item) => (
                                    <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                                        <div className="relative h-48 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)]">
                                            {item.gambar ? (
                                                <Image
                                                    src={item.gambar}
                                                    alt={item.nama}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)] flex items-center justify-center mb-4 -mt-12 relative shadow-lg">
                                                <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">{item.nama}</h3>
                                            <p className="text-gray-600 line-clamp-3">{item.deskripsi}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <p className="text-gray-500">Data layanan belum tersedia.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
