'use client';

import { useState, useEffect } from 'react';

interface Dokter {
    id: string;
    nama: string;
    spesialisasi: string;
}

export default function BookingForm() {
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

    const [doctors, setDoctors] = useState<Dokter[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingDoctors, setFetchingDoctors] = useState(true);
    const [success, setSuccess] = useState<{ message: string; kode: string } | null>(null);
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
                setSuccess({
                    message: 'Booking berhasil diajukan! Cek WhatsApp Anda untuk konfirmasi.',
                    kode: data.data?.kode_booking || ''
                });
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

    if (success) {
        return (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Berhasil!</h2>
                <p className="text-gray-600 mb-4">{success.message}</p>
                {success.kode && (
                    <div className="bg-[var(--color-primary)]/10 rounded-xl p-4 mb-6">
                        <p className="text-sm text-gray-500 mb-1">Kode Booking Anda</p>
                        <p className="text-2xl font-bold text-[var(--color-primary)]">{success.kode}</p>
                    </div>
                )}
                <p className="text-sm text-gray-500 mb-6">
                    Simpan kode booking ini untuk referensi. Kami akan menghubungi Anda melalui WhatsApp untuk konfirmasi.
                </p>
                <button
                    onClick={() => setSuccess(null)}
                    className="btn btn-primary"
                >
                    Buat Booking Lagi
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Form Booking</h2>
                    <p className="text-sm text-gray-500">Lengkapi data di bawah ini</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {/* Data Pasien */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700 border-b pb-2">Data Pasien</h3>

                    <div>
                        <label className="form-label">Nama Lengkap *</label>
                        <input
                            type="text"
                            name="nama_pasien"
                            value={formData.nama_pasien}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Masukkan nama lengkap sesuai KTP"
                            required
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
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
                                placeholder="16 digit NIK"
                                maxLength={16}
                            />
                            <p className="text-xs text-gray-400 mt-1">Diperlukan untuk integrasi SIMRS</p>
                        </div>
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

                {/* Jadwal Kunjungan */}
                <div className="space-y-4 pt-4">
                    <h3 className="font-semibold text-gray-700 border-b pb-2">Jadwal Kunjungan</h3>

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
                                <option key={doc.id} value={doc.id}>
                                    {doc.nama} - {doc.spesialisasi}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Tanggal Kunjungan *</label>
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
                                    <option key={time} value={time}>{time} WIB</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Keluhan/Riwayat (opsional)</label>
                        <textarea
                            name="keluhan"
                            value={formData.keluhan}
                            onChange={handleChange}
                            className="form-input resize-none"
                            rows={4}
                            placeholder="Jelaskan keluhan atau riwayat penyakit mata Anda..."
                        ></textarea>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full justify-center py-4 text-lg disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white mr-2"></div>
                            Memproses Booking...
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

                <p className="text-xs text-gray-400 text-center">
                    Dengan melakukan booking, Anda menyetujui{' '}
                    <a href="#" className="text-[var(--color-primary)] hover:underline">syarat dan ketentuan</a> yang berlaku.
                </p>
            </form>
        </div>
    );
}
