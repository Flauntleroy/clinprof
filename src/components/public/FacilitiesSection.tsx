'use client';

import { useEffect, useState } from 'react';

interface Fasilitas {
    id: string;
    nama: string;
    deskripsi: string | null;
    gambar: string | null;
    kategori: 'FASILITAS' | 'TEKNOLOGI';
    foto?: string | null;
}

export default function FacilitiesSection() {
    const [facilitiesData, setFacilitiesData] = useState<Fasilitas[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const response = await fetch('/api/v1/fasilitas');
                const data = await response.json();
                if (data.success && data.data?.items) {
                    setFacilitiesData(data.data.items);
                }
            } catch (error) {
                console.error('Failed to fetch facilities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFacilities();
    }, []);

    const facilities = facilitiesData.filter(item => item.kategori === 'FASILITAS');
    const technologies = facilitiesData.filter(item => item.kategori === 'TEKNOLOGI');

    // Fallback data
    const displayFacilities = facilities.length > 0 ? facilities : [
        { id: '1', nama: 'Ruang Pemeriksaan Modern', deskripsi: 'Ruang pemeriksaan dilengkapi dengan peralatan diagnostik canggih untuk hasil yang akurat.', gambar: null },
        { id: '2', nama: 'Ruang Operasi Steril', deskripsi: 'Ruang operasi dengan standar sterilisasi tinggi untuk keamanan prosedur bedah.', gambar: null },
        { id: '3', nama: 'Ruang Tunggu Nyaman', deskripsi: 'Area tunggu yang nyaman dengan AC dan entertainment untuk kenyamanan pasien.', gambar: null },
    ];

    const displayTech = technologies.length > 0 ? technologies : [
        { id: '1', nama: 'OCT Scanner', deskripsi: 'Optical Coherence Tomography untuk pencitraan retina dengan resolusi tinggi.', gambar: null },
        { id: '2', nama: 'Autorefractometer', deskripsi: 'Pengukuran refraksi mata otomatis untuk menentukan kacamata yang tepat.', gambar: null },
        { id: '3', nama: 'Phaco Machine', deskripsi: 'Mesin phacoemulsification terbaru untuk operasi katarak minimal invasif.', gambar: null },
    ];

    return (
        <section id="fasilitas" className="section bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-[var(--color-primary)]/10 rounded-full px-4 py-2 mb-4">
                        <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full"></span>
                        <span className="text-sm font-medium text-[var(--color-primary)]">Fasilitas & Teknologi</span>
                    </div>
                    <h2 className="section-title text-[var(--color-primary)]">
                        Fasilitas <span className="text-[var(--color-accent)]">Terbaik</span>
                    </h2>
                    <p className="section-subtitle">
                        Didukung oleh fasilitas modern dan teknologi medis terkini untuk pelayanan optimal.
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                    </div>
                )}

                {/* Facilities Grid */}
                {!loading && (
                    <div className="mb-20">
                        <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-8 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/20">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </span>
                            Fasilitas Klinik
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {displayFacilities.map((item) => (
                                <div key={item.id} className="card group overflow-hidden">
                                    {/* Image Container */}
                                    <div className="relative aspect-[4/3] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] overflow-hidden">
                                        {item.gambar ? (
                                            <img
                                                src={item.gambar}
                                                alt={item.nama || ''}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-white/20">
                                                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z" />
                                                </svg>
                                            </div>
                                        )}
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-[var(--color-primary)]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <span className="px-4 py-2 bg-white text-[var(--color-primary)] rounded-lg font-medium shadow-lg">Lihat Detail</span>
                                        </div>
                                    </div>
                                    {/* Content */}
                                    <div className="p-6">
                                        <h4 className="text-xl font-bold text-[var(--color-primary)] mb-2 group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
                                            {item.nama}
                                        </h4>
                                        <p className="text-[var(--color-gray-500)] text-sm line-clamp-2">
                                            {item.deskripsi}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Technologies Grid */}
                {!loading && (
                    <div>
                        <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-8 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/20">
                                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </span>
                            Teknologi Medis
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {displayTech.map((item) => (
                                <div key={item.id} className="card group overflow-hidden">
                                    {/* Image Container */}
                                    <div className="relative aspect-[4/3] bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] overflow-hidden">
                                        {item.gambar ? (
                                            <img
                                                src={item.gambar}
                                                alt={item.nama || ''}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-[var(--color-primary)]/20">
                                                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-[var(--color-accent)]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <span className="px-4 py-2 bg-white text-[var(--color-primary)] rounded-lg font-medium shadow-lg">Lihat Spesifikasi</span>
                                        </div>
                                    </div>
                                    {/* Content */}
                                    <div className="p-6">
                                        <h4 className="text-xl font-bold text-[var(--color-primary)] mb-2 group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
                                            {item.nama}
                                        </h4>
                                        <p className="text-[var(--color-gray-500)] text-sm line-clamp-2">
                                            {item.deskripsi}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
