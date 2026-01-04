'use client';

import { useState, useEffect } from 'react';

export default function BookingSection() {
    const [formData, setFormData] = useState({
        nama_pasien: '',
        nik: '',
        alamat: '',
        telepon: '',
        email: '',
        dokter_id: '',
        tanggal: '',
        waktu: '',
        keluhan: '',
    });

    const [doctors, setDoctors] = useState<{ id: string, nama: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingDoctors, setFetchingDoctors] = useState(true);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await fetch('/api/v1/dokter?active=true');
                const data = await response.json();
                if (data.success) {
                    setDoctors(data.data.items);
                }
            } catch (err) {
                console.error('Failed to fetch doctors:', err);
            } finally {
                setFetchingDoctors(false);
            }
        };
        fetchDoctors();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/api/v1/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();

            if (data.success) {
                setSuccess('Booking berhasil diajukan! Cek WhatsApp Anda untuk konfirmasi.');
                setFormData({
                    nama_pasien: '',
                    nik: '',
                    alamat: '',
                    telepon: '',
                    email: '',
                    dokter_id: '',
                    tanggal: '',
                    waktu: '',
                    keluhan: '',
                });
            } else {
                setError(data.message || 'Gagal mengirim booking');
            }
        } catch (err) {
            setError('Terjadi kesalahan koneksi');
        } finally {
            setLoading(false);
        }
    };

    const timeSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30',
    ];

    const getTomorrowDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    return (
        <section id="booking" className="section relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 gradient-hero opacity-95"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-accent)]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-2xl"></div>

            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="text-white">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                            <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-pulse"></span>
                            <span className="text-sm font-medium">Booking Online</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                            Jadwalkan <span className="text-[var(--color-accent)]">Kunjungan</span> Anda
                        </h2>

                        <p className="text-white/80 text-lg mb-8">
                            Booking online untuk pemeriksaan mata dengan mudah dan cepat.
                            Pilih dokter dan waktu yang sesuai dengan jadwal Anda.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Konfirmasi Instan</h4>
                                    <p className="text-white/60 text-sm">Dapatkan konfirmasi via WhatsApp</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Hemat Waktu</h4>
                                    <p className="text-white/60 text-sm">Tidak perlu antri panjang</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Jadwal Fleksibel</h4>
                                    <p className="text-white/60 text-sm">Pilih waktu sesuai kebutuhan</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Form */}
                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-6">
                            Form Booking
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {success && (
                                <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm">
                                    {success}
                                </div>
                            )}
                            {error && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="form-label">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    name="nama_pasien"
                                    value={formData.nama_pasien}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Masukkan nama lengkap"
                                    required
                                />
                            </div>

                            <div>
                                <label className="form-label">NIK (Nomor Induk Kependudukan)</label>
                                <input
                                    type="text"
                                    name="nik"
                                    value={formData.nik}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                        setFormData({ ...formData, nik: val });
                                    }}
                                    className="form-input"
                                    placeholder="16 digit NIK (opsional)"
                                    maxLength={16}
                                />
                                <p className="text-xs text-gray-500 mt-1">NIK diperlukan untuk integrasi dengan SIMRS</p>
                            </div>

                            <div>
                                <label className="form-label">Alamat</label>
                                <input
                                    type="text"
                                    name="alamat"
                                    value={formData.alamat}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Alamat lengkap"
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">No. WhatsApp *</label>
                                    <input
                                        type="tel"
                                        name="telepon"
                                        value={formData.telepon}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="08xxxxxxxxxx"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Pilih Dokter *</label>
                                <select
                                    name="dokter_id"
                                    value={formData.dokter_id}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                    disabled={fetchingDoctors}
                                >
                                    <option value="">{fetchingDoctors ? 'Memuat Dokter...' : '-- Pilih Dokter --'}</option>
                                    {doctors.map((doc) => (
                                        <option key={doc.id} value={doc.id}>{doc.nama}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Tanggal *</label>
                                    <input
                                        type="date"
                                        name="tanggal"
                                        value={formData.tanggal}
                                        onChange={handleChange}
                                        min={getTomorrowDate()}
                                        className="form-input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Waktu *</label>
                                    <select
                                        name="waktu"
                                        value={formData.waktu}
                                        onChange={handleChange}
                                        className="form-input"
                                        required
                                    >
                                        <option value="">-- Pilih Waktu --</option>
                                        {timeSlots.map((time) => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Keluhan (opsional)</label>
                                <textarea
                                    name="keluhan"
                                    value={formData.keluhan}
                                    onChange={handleChange}
                                    className="form-input resize-none"
                                    rows={3}
                                    placeholder="Jelaskan keluhan Anda..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full justify-center disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2"></div>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Booking Sekarang
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-[var(--color-gray-500)] text-center">
                                Dengan melakukan booking, Anda menyetujui syarat dan ketentuan yang berlaku.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
