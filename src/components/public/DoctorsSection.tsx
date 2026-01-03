'use client';

import { useEffect, useState } from 'react';

interface Dokter {
    id: string;
    nama: string;
    spesialisasi: string;
    foto: string | null;
    bio: string | null;
    jadwal?: string;
}

export default function DoctorsSection() {
    const [doctors, setDoctors] = useState<Dokter[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await fetch('/api/v1/dokter');
                const data = await response.json();
                if (data.success && data.data?.items) {
                    setDoctors(data.data.items);
                }
            } catch (error) {
                console.error('Failed to fetch doctors:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    // Helper to get full image URL
    const getImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return path.startsWith('/') ? path : `/${path}`;
    };

    // Fallback data if API is not available
    const displayDoctors = doctors.length > 0 ? doctors : [
        {
            id: '1',
            nama: 'dr. Contoh Spesialis, Sp.M',
            spesialisasi: 'Spesialis Mata',
            bio: 'Berpengalaman lebih dari 15 tahun dalam bidang kesehatan mata dengan keahlian khusus dalam operasi katarak dan laser.',
            foto: null,
            jadwal: 'Sen - Sab, 08:00 - 17:00'
        },
        {
            id: '2',
            nama: 'dr. Praktisi Mata, Sp.M',
            spesialisasi: 'Spesialis Mata Anak',
            bio: 'Fokus pada penanganan gangguan penglihatan pada anak-anak dan remaja dengan pendekatan yang ramah dan komunikatif.',
            foto: null,
            jadwal: 'Sen - Sab, 08:00 - 17:00'
        },
        {
            id: '3',
            nama: 'dr. Ahli Retina, Sp.M(K)',
            spesialisasi: 'Subspesialis Retina',
            bio: 'Konsultan retina dengan keahlian dalam penanganan degenerasi makula dan retinopati diabetik.',
            foto: null,
            jadwal: 'Sen - Sab, 08:00 - 17:00'
        },
    ];

    return (
        <section id="dokter" className="section bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-[var(--color-primary)]/10 rounded-full px-4 py-2 mb-4">
                        <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full"></span>
                        <span className="text-sm font-medium text-[var(--color-primary)]">Tim Dokter</span>
                    </div>
                    <h2 className="section-title text-[var(--color-primary)]">
                        Dokter <span className="text-[var(--color-accent)]">Spesialis</span> Kami
                    </h2>
                    <p className="section-subtitle">
                        Tim dokter spesialis mata berpengalaman yang siap memberikan pelayanan terbaik untuk kesehatan mata Anda.
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                    </div>
                )}

                {/* Doctors Grid */}
                {!loading && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayDoctors.map((doctor, index) => (
                            <div
                                key={doctor.id}
                                className="card group"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Photo */}
                                <div className="relative aspect-[4/3] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] overflow-hidden">
                                    {doctor.foto ? (
                                        <img
                                            src={getImageUrl(doctor.foto) || ''}
                                            alt={doctor.nama}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <svg className="w-24 h-24 text-white/30" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                            </svg>
                                        </div>
                                    )}
                                    {/* Overlay on Hover */}
                                    <div className="absolute inset-0 bg-[var(--color-accent)]/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button className="btn bg-white text-[var(--color-primary)] hover:bg-[var(--color-gray-100)]">
                                            Lihat Profil
                                        </button>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-[var(--color-primary)] mb-1">
                                        {doctor.nama}
                                    </h3>
                                    <p className="text-[var(--color-accent)] font-medium mb-3">
                                        {doctor.spesialisasi}
                                    </p>
                                    <p className="text-[var(--color-gray-500)] text-sm line-clamp-2">
                                        {doctor.bio}
                                    </p>

                                    {/* Schedule Hint */}
                                    <div className="mt-4 pt-4 border-t border-[var(--color-gray-100)] flex items-center gap-2 text-sm text-[var(--color-gray-500)]">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{doctor.jadwal || "Jadwal belum tersedia"}</span>
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
