'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface HeroContent {
    badge: string;
    title_line1: string;
    title_line2: string;
    subtitle: string;
    stats: {
        value: string;
        label: string;
    }[];
}

const defaultContent: HeroContent = {
    badge: "Klinik Spesialis Mata Terpercaya",
    title_line1: "Penglihatan Jernih,",
    title_line2: "Hidup Lebih Bermakna",
    subtitle: "Klinik Spesialis Mata Makula Bahalap hadir memberikan pelayanan kesehatan mata terbaik dengan teknologi modern dan dokter spesialis berpengalaman.",
    stats: [
        { value: "10+", label: "Tahun Pengalaman" },
        { value: "5000+", label: "Pasien Ditangani" },
        { value: "5", label: "Dokter Spesialis" },
        { value: "98%", label: "Tingkat Kepuasan" },
    ],
};

export default function HeroSection() {
    const [content, setContent] = useState<HeroContent>(defaultContent);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHeroContent = async () => {
            try {
                const response = await fetch('/api/v1/konten?kunci=hero');
                const data = await response.json();
                if (data.success && data.data?.nilai) {
                    setContent(data.data.nilai);
                }
            } catch (error) {
                console.error('Failed to fetch hero content:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHeroContent();
    }, []);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 gradient-hero opacity-95"></div>

            {/* Abstract Eye Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 right-0 w-96 h-96 bg-[var(--color-accent)]/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-2xl"></div>
                <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[var(--color-primary-light)]/20 rounded-full blur-3xl"></div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-20 right-20 hidden lg:block">
                <div className="w-32 h-32 border-2 border-[var(--color-accent)]/30 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute bottom-32 left-20 hidden lg:block">
                <div className="w-24 h-24 border border-white/20 rounded-full"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 text-center text-white py-32">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 animate-fade-in-up">
                    <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-pulse"></span>
                    <span className="text-sm font-medium">{content.badge}</span>
                </div>

                {/* Main Title */}
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 animate-fade-in-up delay-100">
                    <span className="block">{content.title_line1}</span>
                    <span className="text-[var(--color-accent)]">{content.title_line2}</span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
                    {content.subtitle}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
                    <Link href="/booking" className="btn btn-accent animate-pulse-gold">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Booking Sekarang
                    </Link>
                    <Link href="#layanan" className="btn btn-outline-light">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Lihat Layanan
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 animate-fade-in-up delay-400">
                    {(Array.isArray(content.stats) ? content.stats : defaultContent.stats).map((stat, index) => (
                        <div key={index} className="glass rounded-xl p-6">
                            <div className="text-3xl md:text-4xl font-bold text-[var(--color-accent)]">{stat.value}</div>
                            <div className="text-sm text-white/70">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <a href="#tentang" className="flex flex-col items-center text-white/60 hover:text-white transition-colors">
                    <span className="text-xs mb-2">Scroll</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </a>
            </div>
        </section>
    );
}
