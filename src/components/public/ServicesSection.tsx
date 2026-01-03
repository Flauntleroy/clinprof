'use client';

import { useEffect, useState } from 'react';

interface Layanan {
    id: string;
    nama: string;
    deskripsi: string;
    icon: string | null;
}

// Default icons for services
const defaultIcons: Record<string, React.ReactNode> = {
    pemeriksaan: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    ),
    katarak: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
    ),
    laser: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    default: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

export default function ServicesSection() {
    const [services, setServices] = useState<Layanan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('/api/v1/layanan');
                const data = await response.json();
                if (data.success && data.data?.items) {
                    setServices(data.data.items);
                }
            } catch (error) {
                console.error('Failed to fetch services:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    // Fallback services
    const displayServices = services.length > 0 ? services : [
        { id: '1', nama: 'Pemeriksaan Mata Lengkap', deskripsi: 'Pemeriksaan menyeluruh untuk mendeteksi berbagai gangguan penglihatan dan penyakit mata.', icon: 'pemeriksaan' },
        { id: '2', nama: 'Operasi Katarak', deskripsi: 'Prosedur operasi katarak modern dengan teknik phacoemulsification untuk pemulihan cepat.', icon: 'katarak' },
        { id: '3', nama: 'Laser Mata (LASIK)', deskripsi: 'Koreksi penglihatan dengan teknologi laser terkini untuk mengurangi ketergantungan pada kacamata.', icon: 'laser' },
        { id: '4', nama: 'Terapi Mata Malas', deskripsi: 'Penanganan ambliopia (mata malas) pada anak-anak dengan metode terapi yang efektif.', icon: null },
        { id: '5', nama: 'Glaukoma Treatment', deskripsi: 'Deteksi dini dan penanganan glaukoma untuk mencegah kerusakan saraf mata.', icon: null },
        { id: '6', nama: 'Kacamata & Lensa Kontak', deskripsi: 'Layanan pengukuran dan pemasangan kacamata serta lensa kontak dengan akurasi tinggi.', icon: null },
    ];

    const isImagePath = (path: string | null) => {
        return path && (path.startsWith('/') || path.startsWith('http'));
    };

    const getIcon = (iconKey: string | null) => {
        if (iconKey && defaultIcons[iconKey]) {
            return defaultIcons[iconKey];
        }
        return defaultIcons.default;
    };

    return (
        <section id="layanan" className="section bg-[var(--color-gray-50)]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-[var(--color-primary)]/10 rounded-full px-4 py-2 mb-4">
                        <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full"></span>
                        <span className="text-sm font-medium text-[var(--color-primary)]">Layanan Kami</span>
                    </div>
                    <h2 className="section-title text-[var(--color-primary)]">
                        Layanan <span className="text-[var(--color-accent)]">Unggulan</span>
                    </h2>
                    <p className="section-subtitle">
                        Kami menyediakan berbagai layanan kesehatan mata dengan standar kualitas tinggi dan teknologi terkini.
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                    </div>
                )}

                {!loading && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayServices.map((service, index) => (
                            <div
                                key={service.id}
                                className="card group overflow-hidden"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Header / Image */}
                                <div className="relative aspect-[4/3] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] overflow-hidden">
                                    {isImagePath(service.icon) ? (
                                        <img
                                            src={service.icon!}
                                            alt={service.nama}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-white/30">
                                            {getIcon(service.icon)}
                                        </div>
                                    )}

                                    {/* Overlay on Hover */}
                                    <div className="absolute inset-0 bg-[var(--color-primary)]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button className="btn bg-white text-[var(--color-primary)] hover:bg-[var(--color-gray-100)]">
                                            Pelajari Detail
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                                        {service.nama}
                                    </h3>
                                    <p className="text-[var(--color-gray-500)] line-clamp-3 mb-4">
                                        {service.deskripsi}
                                    </p>

                                    {/* Action Link */}
                                    <div className="flex items-center text-[var(--color-accent)] font-medium">
                                        <span className="text-sm">Selengkapnya</span>
                                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
