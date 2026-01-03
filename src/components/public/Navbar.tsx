'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { href: '#tentang', label: 'Tentang' },
        { href: '#dokter', label: 'Dokter' },
        { href: '#layanan', label: 'Layanan' },
        { href: '#fasilitas', label: 'Fasilitas' },
        { href: '/berita', label: 'Berita' },
        { href: '#kontak', label: 'Kontak' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white/95 backdrop-blur-md shadow-lg py-2'
                : 'bg-transparent py-4'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/Makula Bahalap-Landscape.png"
                            alt="Makula Bahalap"
                            width={180}
                            height={50}
                            className="h-10 w-auto"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`font-medium transition-colors ${isScrolled
                                    ? 'text-[var(--color-gray-700)] hover:text-[var(--color-primary)]'
                                    : 'text-white hover:text-[var(--color-accent)]'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/booking"
                            className={`btn ${isScrolled ? 'btn-primary' : 'btn-accent'
                                } !py-2 !px-5`}
                        >
                            Booking Online
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`md:hidden p-2 rounded-lg ${isScrolled ? 'text-[var(--color-primary)]' : 'text-white'
                            }`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden mt-4 py-4 bg-white rounded-xl shadow-xl animate-fade-in">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="block px-4 py-3 text-[var(--color-gray-700)] hover:bg-[var(--color-gray-50)] hover:text-[var(--color-primary)]"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="px-4 pt-3">
                            <Link
                                href="/booking"
                                className="btn btn-primary w-full"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Booking Online
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
