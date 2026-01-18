'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LogoSettings {
    logo_url: string;
    logo_width: string;
    logo_height: string;
}

interface SocialLink {
    platform: string;
    url: string;
    enabled: boolean;
}

interface Layanan {
    nama: string;
}

interface FooterContent {
    deskripsi: string;
    alamat: string;
    telepon: string;
    email: string;
    social_links: SocialLink[];
    layanan_list: Layanan[];
    copyright_text: string;
}

const defaultFooterContent: FooterContent = {
    deskripsi: "Klinik Spesialis Mata terpercaya dengan pelayanan prima dan teknologi modern.",
    alamat: "Jl. Contoh No. 123, Kota, Indonesia",
    telepon: "0812-3456-7890",
    email: "info@makulabahalap.com",
    social_links: [
        { platform: "Facebook", url: "#", enabled: true },
        { platform: "Instagram", url: "#", enabled: true },
        { platform: "WhatsApp", url: "#", enabled: true },
    ],
    layanan_list: [
        { nama: "Pemeriksaan Mata" },
        { nama: "Operasi Katarak" },
        { nama: "Terapi Mata Malas" },
        { nama: "Laser Mata" },
        { nama: "Kacamata & Lensa" },
    ],
    copyright_text: "Klinik Spesialis Mata Makula Bahalap. All rights reserved.",
};

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const [logo, setLogo] = useState<LogoSettings>({
        logo_url: '/Makula Bahalap-Landscape.png',
        logo_width: '180',
        logo_height: '50',
    });
    const [content, setContent] = useState<FooterContent>(defaultFooterContent);

    useEffect(() => {
        // Fetch logo settings
        const fetchLogo = async () => {
            try {
                const response = await fetch('/api/v1/konten?kunci=pengaturan_umum');
                const data = await response.json();
                if (data.success && data.data?.nilai) {
                    const settings = data.data.nilai;
                    if (settings.logo_url) {
                        setLogo({
                            logo_url: settings.logo_url,
                            logo_width: settings.logo_width || '180',
                            logo_height: settings.logo_height || '50',
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to fetch logo:', error);
            }
        };

        // Fetch footer content
        const fetchFooterContent = async () => {
            try {
                const response = await fetch('/api/v1/konten?kunci=footer');
                const data = await response.json();
                if (data.success && data.data?.nilai) {
                    const fetchedContent = data.data.nilai;
                    setContent({
                        deskripsi: fetchedContent.deskripsi || defaultFooterContent.deskripsi,
                        alamat: fetchedContent.alamat || defaultFooterContent.alamat,
                        telepon: fetchedContent.telepon || defaultFooterContent.telepon,
                        email: fetchedContent.email || defaultFooterContent.email,
                        social_links: Array.isArray(fetchedContent.social_links) ? fetchedContent.social_links : defaultFooterContent.social_links,
                        layanan_list: Array.isArray(fetchedContent.layanan_list) ? fetchedContent.layanan_list : defaultFooterContent.layanan_list,
                        copyright_text: fetchedContent.copyright_text || defaultFooterContent.copyright_text,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch footer content:', error);
            }
        };

        fetchLogo();
        fetchFooterContent();
    }, []);

    // Get enabled social links
    const enabledSocialLinks = content.social_links.filter(s => s.enabled);

    // Social media icons
    const getSocialIcon = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'facebook':
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                );
            case 'instagram':
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                );
            case 'whatsapp':
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <footer className="bg-[var(--color-primary)] text-white">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <img
                            src={logo.logo_url}
                            alt="Makula Bahalap"
                            width={parseInt(logo.logo_width)}
                            height={parseInt(logo.logo_height)}
                            className="h-12 w-auto mb-4 brightness-0 invert object-contain"
                        />
                        <p className="text-[var(--color-gray-300)] mb-6">
                            {content.deskripsi}
                        </p>
                        <div className="flex gap-4">
                            {enabledSocialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--color-accent)] transition-colors"
                                >
                                    {getSocialIcon(social.platform)}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-[var(--color-accent)]">Menu</h3>
                        <ul className="space-y-3">
                            <li><Link href="#tentang" className="text-[var(--color-gray-300)] hover:text-white transition-colors">Tentang Kami</Link></li>
                            <li><Link href="#dokter" className="text-[var(--color-gray-300)] hover:text-white transition-colors">Dokter Spesialis</Link></li>
                            <li><Link href="#layanan" className="text-[var(--color-gray-300)] hover:text-white transition-colors">Layanan</Link></li>
                            <li><Link href="#fasilitas" className="text-[var(--color-gray-300)] hover:text-white transition-colors">Fasilitas</Link></li>
                            <li><Link href="/booking" className="text-[var(--color-gray-300)] hover:text-white transition-colors">Booking Online</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-[var(--color-accent)]">Layanan</h3>
                        <ul className="space-y-3">
                            {content.layanan_list.map((layanan, index) => (
                                <li key={index}>
                                    <span className="text-[var(--color-gray-300)]">{layanan.nama}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-[var(--color-accent)]">Kontak</h3>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <svg className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-[var(--color-gray-300)]">{content.alamat}</span>
                            </li>
                            <li className="flex gap-3">
                                <svg className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-[var(--color-gray-300)]">{content.telepon}</span>
                            </li>
                            <li className="flex gap-3">
                                <svg className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-[var(--color-gray-300)]">{content.email}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[var(--color-gray-400)] text-sm">
                        © {currentYear} {content.copyright_text}
                    </p>
                    <div className="flex gap-6">
                        <Link href="#" className="text-[var(--color-gray-400)] text-sm hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="#" className="text-[var(--color-gray-400)] text-sm hover:text-white transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
