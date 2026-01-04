import { Navbar, Footer } from '@/components/public';
import { Metadata } from 'next';
import BookingForm from './BookingForm';

export const metadata: Metadata = {
    title: 'Booking Online | Klinik Spesialis Mata Makula Bahalap',
    description: 'Jadwalkan kunjungan ke Klinik Spesialis Mata Makula Bahalap secara online. Pilih dokter dan waktu yang sesuai dengan jadwal Anda.',
};

export default function BookingPage() {
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
                            <span className="text-sm font-medium">Booking Online</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Jadwalkan <span className="text-[var(--color-accent)]">Kunjungan</span> Anda
                        </h1>
                        <p className="text-lg text-white/80 max-w-2xl mx-auto">
                            Booking online untuk pemeriksaan mata dengan mudah dan cepat.
                            Pilih dokter dan waktu yang sesuai dengan jadwal Anda.
                        </p>
                    </div>
                </section>

                {/* Booking Form Section */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Left Info - Move to bottom on mobile */}
                            <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <h3 className="font-bold text-lg text-[var(--color-primary)] mb-4">Keuntungan Booking Online</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Konfirmasi Instan</h4>
                                                <p className="text-sm text-gray-500">Dapatkan konfirmasi via WhatsApp</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Hemat Waktu</h4>
                                                <p className="text-sm text-gray-500">Tidak perlu antri panjang</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Jadwal Fleksibel</h4>
                                                <p className="text-sm text-gray-500">Pilih waktu sesuai kebutuhan</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-2xl p-6 text-white">
                                    <h3 className="font-bold text-lg mb-3">Jam Operasional</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-white/70">Senin - Jumat</span>
                                            <span className="font-medium">08:00 - 17:00</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/70">Sabtu</span>
                                            <span className="font-medium">08:00 - 14:00</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/70">Minggu</span>
                                            <span className="font-medium">Tutup</span>
                                        </div>
                                    </div>
                                    <hr className="my-4 border-white/20" />
                                    <p className="text-xs text-white/60">
                                        * Jadwal dapat berubah sewaktu-waktu. Silakan hubungi kami untuk informasi lebih lanjut.
                                    </p>
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <h3 className="font-bold text-lg text-[var(--color-primary)] mb-3">Butuh Bantuan?</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Hubungi kami jika Anda memerlukan bantuan dalam proses booking.
                                    </p>
                                    <a
                                        href="https://wa.me/628112345678"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition font-medium"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        Hubungi via WhatsApp
                                    </a>
                                </div>
                            </div>

                            {/* Right Form - Show first on mobile */}
                            <div className="lg:col-span-2 order-1 lg:order-2">
                                <BookingForm />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
