'use client';

import { useEffect, useState } from 'react';

interface Feature {
    title: string;
    description: string;
}

interface TentangContent {
    heading: string;
    subheading: string;
    paragraph1: string;
    paragraph2: string;
    features: Feature[];
}

const defaultContent: TentangContent = {
    heading: "Melayani dengan",
    subheading: "Sepenuh Hati",
    paragraph1: "Klinik Spesialis Mata Makula Bahalap hadir untuk memberikan pelayanan kesehatan mata terbaik bagi masyarakat. Dengan dukungan dokter spesialis mata berpengalaman dan peralatan medis modern, kami berkomitmen untuk menjaga kesehatan penglihatan Anda.",
    paragraph2: "Kami percaya bahwa setiap orang berhak mendapatkan penglihatan yang jernih. Oleh karena itu, kami terus berinovasi dan mengembangkan layanan kami untuk memberikan pengalaman terbaik bagi setiap pasien.",
    features: [
        { title: "Tim Profesional", description: "Dokter spesialis berpengalaman" },
        { title: "Teknologi Modern", description: "Peralatan medis terkini" },
        { title: "Pelayanan Cepat", description: "Proses efisien & tepat waktu" },
        { title: "Pelayanan Prima", description: "Mengutamakan kenyamanan" },
    ],
};

export default function AboutSection() {
    const [content, setContent] = useState<TentangContent>(defaultContent);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAboutContent = async () => {
            try {
                const response = await fetch('/api/v1/konten?kunci=tentang');
                const data = await response.json();
                if (data.success && data.data?.nilai) {
                    setContent(data.data.nilai);
                }
            } catch (error) {
                console.error('Failed to fetch about content:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAboutContent();
    }, []);

    const featureIcons = [
        <svg key="1" className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>,
        <svg key="2" className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>,
        <svg key="3" className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>,
        <svg key="4" className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    ];

    return (
        <section id="tentang" className="section bg-[var(--color-gray-50)]">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Image Side */}
                    <div className="relative">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                            <div className="aspect-[4/3] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center">
                                <svg className="w-32 h-32 text-white/30" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                </svg>
                            </div>
                        </div>
                        {/* Floating Card */}
                        <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-6 max-w-xs hidden md:block">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                                    <svg className="w-7 h-7 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="font-bold text-[var(--color-primary)]">Bersertifikat</div>
                                    <div className="text-sm text-[var(--color-gray-500)]">Standar Internasional</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Side */}
                    <div>
                        <div className="inline-flex items-center gap-2 bg-[var(--color-primary)]/10 rounded-full px-4 py-2 mb-4">
                            <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full"></span>
                            <span className="text-sm font-medium text-[var(--color-primary)]">Tentang Kami</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-6">
                            {content.heading} <span className="text-[var(--color-accent)]">{content.subheading}</span>
                        </h2>

                        <p className="text-[var(--color-gray-600)] mb-6 leading-relaxed">
                            {content.paragraph1}
                        </p>

                        <p className="text-[var(--color-gray-600)] mb-8 leading-relaxed">
                            {content.paragraph2}
                        </p>

                        {/* Features */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            {(Array.isArray(content.features) ? content.features : defaultContent.features).map((feature, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                        {featureIcons[index] || featureIcons[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-[var(--color-primary)]">{feature.title}</h4>
                                        <p className="text-sm text-[var(--color-gray-500)]">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
