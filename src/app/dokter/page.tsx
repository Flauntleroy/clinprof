import { Navbar, Footer } from '@/components/public';
import { Metadata } from 'next';
import Image from 'next/image';
import { query } from '@/lib/db';

export const metadata: Metadata = {
    title: 'Dokter Spesialis | Klinik Spesialis Mata Makula Bahalap',
    description: 'Temui dokter spesialis mata berpengalaman di Klinik Makula Bahalap.',
};

interface Dokter {
    id: string;
    nama: string;
    spesialisasi: string;
    no_str: string;
    foto: string;
    bio: string;
}

async function getDoctors(): Promise<Dokter[]> {
    try {
        const doctors = await query<Dokter>(
            'SELECT id, nama, spesialisasi, no_str, foto, bio FROM dokter WHERE is_active = 1 ORDER BY urutan, nama'
        );
        return doctors;
    } catch (error) {
        console.error('Failed to fetch doctors:', error);
        return [];
    }
}

export default async function DokterPage() {
    const doctors = await getDoctors();

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
                            <span className="text-sm font-medium">Tim Medis</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Dokter <span className="text-[var(--color-accent)]">Spesialis</span> Kami
                        </h1>
                        <p className="text-lg text-white/80 max-w-2xl mx-auto">
                            Didukung oleh tim dokter spesialis mata berpengalaman dengan komitmen memberikan pelayanan terbaik.
                        </p>
                    </div>
                </section>

                {/* Doctors Grid */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {doctors.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {doctors.map((doctor) => (
                                    <div key={doctor.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                        <div className="relative h-64 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)]">
                                            {doctor.foto ? (
                                                <Image
                                                    src={doctor.foto}
                                                    alt={doctor.nama}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <svg className="w-24 h-24 text-white/30" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-800 mb-1">{doctor.nama}</h3>
                                            <p className="text-[var(--color-primary)] font-medium mb-2">{doctor.spesialisasi}</p>
                                            {doctor.no_str && (
                                                <p className="text-sm text-gray-500 mb-3">STR: {doctor.no_str}</p>
                                            )}
                                            {doctor.bio && (
                                                <p className="text-sm text-gray-600 line-clamp-3">{doctor.bio}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <p className="text-gray-500">Data dokter belum tersedia.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
