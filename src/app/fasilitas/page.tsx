import { Navbar, Footer } from '@/components/public';
import { Metadata } from 'next';
import Image from 'next/image';
import { query } from '@/lib/db';

export const metadata: Metadata = {
    title: 'Fasilitas | Klinik Spesialis Mata Makula Bahalap',
    description: 'Fasilitas modern dan lengkap di Klinik Spesialis Mata Makula Bahalap.',
};

interface Fasilitas {
    id: string;
    nama: string;
    deskripsi: string;
    gambar: string;
}

async function getFasilitas(): Promise<Fasilitas[]> {
    try {
        const fasilitas = await query<Fasilitas>(
            'SELECT id, nama, deskripsi, gambar FROM fasilitas WHERE is_active = 1 ORDER BY urutan, nama'
        );
        return fasilitas;
    } catch (error) {
        console.error('Failed to fetch fasilitas:', error);
        return [];
    }
}

export default async function FasilitasPage() {
    const fasilitas = await getFasilitas();

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
                            <span className="text-sm font-medium">Fasilitas</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Fasilitas <span className="text-[var(--color-accent)]">Modern</span>
                        </h1>
                        <p className="text-lg text-white/80 max-w-2xl mx-auto">
                            Dilengkapi dengan peralatan canggih dan ruangan nyaman untuk menunjang kualitas pelayanan terbaik.
                        </p>
                    </div>
                </section>

                {/* Facilities Grid */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {fasilitas.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {fasilitas.map((item) => (
                                    <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                                        <div className="relative h-56 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)]">
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
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">{item.nama}</h3>
                                            <p className="text-gray-600">{item.deskripsi}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <p className="text-gray-500">Data fasilitas belum tersedia.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
