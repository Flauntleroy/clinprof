'use client';

import { useEffect, useState } from 'react';

interface JamOperasional {
    hari: string;
    jam: string;
    tutup: boolean;
}

interface KontakContent {
    alamat: string;
    telepon: string;
    whatsapp: string;
    email: string;
    google_maps_embed: string;
    jam_operasional: JamOperasional[];
}

const defaultContent: KontakContent = {
    alamat: "Jl. Contoh No. 123, Kota, Indonesia 12345",
    telepon: "0812-3456-7890",
    whatsapp: "6281234567890",
    email: "info@makulabahalap.com",
    google_maps_embed: "",
    jam_operasional: [
        { hari: "Senin - Jumat", jam: "08:00 - 17:00", tutup: false },
        { hari: "Sabtu", jam: "08:00 - 14:00", tutup: false },
        { hari: "Minggu", jam: "Tutup", tutup: true },
    ],
};

export default function ContactSection() {
    const [content, setContent] = useState<KontakContent>(defaultContent);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContactContent = async () => {
            try {
                const response = await fetch('/api/v1/konten?kunci=kontak');
                const data = await response.json();
                if (data.success && data.data?.nilai) {
                    setContent(data.data.nilai);
                }
            } catch (error) {
                console.error('Failed to fetch contact content:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContactContent();
    }, []);

    return (
        <section id="kontak" className="section bg-[var(--color-gray-50)]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-[var(--color-primary)]/10 rounded-full px-4 py-2 mb-4">
                        <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full"></span>
                        <span className="text-sm font-medium text-[var(--color-primary)]">Hubungi Kami</span>
                    </div>
                    <h2 className="section-title text-[var(--color-primary)]">
                        Lokasi & <span className="text-[var(--color-accent)]">Kontak</span>
                    </h2>
                    <p className="section-subtitle">
                        Kunjungi klinik kami atau hubungi untuk informasi lebih lanjut.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Address */}
                        <div className="card p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-[var(--color-primary)] mb-1">Alamat</h4>
                                    <p className="text-[var(--color-gray-500)] whitespace-pre-line">
                                        {content.alamat}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="card p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-[var(--color-primary)] mb-1">Telepon / WhatsApp</h4>
                                    <a
                                        href={`tel:${content.telepon.replace(/[^0-9+]/g, '')}`}
                                        className="text-[var(--color-gray-500)] hover:text-[var(--color-primary)] block"
                                    >
                                        {content.telepon}
                                    </a>
                                    <a
                                        href={`https://wa.me/${content.whatsapp.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mt-2 font-medium"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        Chat via WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Hours */}
                        <div className="card p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-[var(--color-primary)] mb-2">Jam Operasional</h4>
                                    <ul className="space-y-1 text-[var(--color-gray-500)]">
                                        {(Array.isArray(content.jam_operasional) ? content.jam_operasional : defaultContent.jam_operasional).map((jam, index) => (
                                            <li key={index} className="flex justify-between gap-4">
                                                <span>{jam.hari}</span>
                                                <span className={`font-medium ${jam.tutup ? 'text-red-500' : ''}`}>
                                                    {jam.tutup ? 'Tutup' : jam.jam}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map */}
                    <div className="lg:col-span-2">
                        <div className="card h-full min-h-[400px] overflow-hidden">
                            {content.google_maps_embed ? (
                                <iframe
                                    src={content.google_maps_embed}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, minHeight: '400px' }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Google Maps"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center">
                                    <div className="text-center text-white p-8">
                                        <svg className="w-16 h-16 mx-auto mb-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <h4 className="text-xl font-bold mb-2">Peta Lokasi</h4>
                                        <p className="text-white/70 mb-4">
                                            Hubungi kami untuk informasi lokasi lengkap
                                        </p>
                                        <a
                                            href="https://maps.google.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn bg-white text-[var(--color-primary)] hover:bg-[var(--color-gray-100)]"
                                        >
                                            Buka di Google Maps
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
