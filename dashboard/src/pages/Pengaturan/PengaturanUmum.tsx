import { useState, useEffect, useRef } from "react";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import { useToast } from "../../context/ToastContext";
import { apiGet, apiPut, getMediaUrl } from "../../lib/api";

interface Pengaturan {
    key: string;
    value: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function PengaturanUmum() {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [settings, setSettings] = useState({
        nama_klinik: "Klinik Spesialis Mata Makula Bahalap",
        alamat: "",
        telepon: "",
        email: "",
        jam_operasional: "Senin - Sabtu: 08:00 - 17:00",
        google_maps_embed: "",
        logo_url: "",
        logo_width: "180",
        logo_height: "50",
    });

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const response = await apiGet<{ nilai: typeof settings }>("/konten?kunci=pengaturan_umum");
                if (response.success && response.data?.nilai) {
                    const fetchedSettings = response.data.nilai;
                    setSettings({
                        nama_klinik: fetchedSettings.nama_klinik || settings.nama_klinik,
                        alamat: fetchedSettings.alamat || "",
                        telepon: fetchedSettings.telepon || "",
                        email: fetchedSettings.email || "",
                        jam_operasional: fetchedSettings.jam_operasional || settings.jam_operasional,
                        google_maps_embed: fetchedSettings.google_maps_embed || "",
                        logo_url: fetchedSettings.logo_url || "",
                        logo_width: fetchedSettings.logo_width || "180",
                        logo_height: fetchedSettings.logo_height || "50",
                    });
                }
            } catch (err) {
                console.error("Failed to fetch settings:", err);
            }
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            addToast('error', 'File harus berupa gambar (PNG, JPG, SVG)', 'Format Tidak Valid');
            return;
        }

        // Validate file size (max 20MB)
        if (file.size > 20 * 1024 * 1024) {
            addToast('error', 'Ukuran file maksimal 20MB', 'File Terlalu Besar');
            return;
        }

        setUploadingLogo(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'logo');

            const response = await fetch(`${API_BASE}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                },
                body: formData,
            });

            const data = await response.json();
            if (data.success && data.data?.url) {
                setSettings((prev) => ({ ...prev, logo_url: data.data.url }));
                addToast('success', 'Logo berhasil diupload', 'Berhasil');
            } else {
                addToast('error', data.error || 'Gagal mengupload logo', 'Gagal');
            }
        } catch (error) {
            console.error('Upload error:', error);
            addToast('error', 'Terjadi kesalahan saat mengupload', 'Gagal');
        }
        setUploadingLogo(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Save all settings as single object with kunci 'pengaturan_umum'
            const response = await apiPut("/konten", {
                kunci: "pengaturan_umum",
                nilai: settings,
            });
            if (response.success) {
                addToast('success', 'Pengaturan berhasil disimpan!', 'Berhasil');
            } else {
                addToast('error', response.error || 'Gagal menyimpan pengaturan', 'Gagal');
            }
        } catch {
            addToast('error', 'Gagal menyimpan pengaturan', 'Gagal');
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    return (
        <>
            <PageMeta title="Pengaturan Umum | Makula Bahalap" />
            <PageBreadcrumb pageTitle="Pengaturan Umum" />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Logo Settings */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Pengaturan Logo
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Logo Preview & Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                                Logo Klinik
                            </label>
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center">
                                {settings.logo_url ? (
                                    <div className="space-y-4">
                                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 inline-block">
                                            <img
                                                src={getMediaUrl(settings.logo_url)}
                                                alt="Logo Preview"
                                                style={{
                                                    width: `${settings.logo_width}px`,
                                                    height: `${settings.logo_height}px`,
                                                    objectFit: 'contain'
                                                }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">Preview dengan ukuran yang dikonfigurasi</p>
                                    </div>
                                ) : (
                                    <div className="py-8">
                                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-gray-500">Belum ada logo</p>
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingLogo}
                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 dark:bg-brand-900/30 dark:text-brand-400 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/50 transition disabled:opacity-50"
                                >
                                    {uploadingLogo ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-500/20 border-t-brand-500"></div>
                                            Mengupload...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            {settings.logo_url ? 'Ganti Logo' : 'Upload Logo'}
                                        </>
                                    )}
                                </button>
                                <p className="mt-2 text-xs text-gray-400">PNG, JPG, SVG (Max. 20MB)</p>
                            </div>
                        </div>

                        {/* Logo Size Settings */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    URL Logo (atau isi manual)
                                </label>
                                <input
                                    type="text"
                                    name="logo_url"
                                    value={settings.logo_url}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    placeholder="/uploads/logo.png atau URL eksternal"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        Lebar Logo (px)
                                    </label>
                                    <input
                                        type="number"
                                        name="logo_width"
                                        value={settings.logo_width}
                                        onChange={handleChange}
                                        min={50}
                                        max={500}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        Tinggi Logo (px)
                                    </label>
                                    <input
                                        type="number"
                                        name="logo_height"
                                        value={settings.logo_height}
                                        onChange={handleChange}
                                        min={20}
                                        max={200}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    <strong>Tips:</strong> Ukuran logo default adalah 180x50 pixel. Sesuaikan ukuran agar logo tampil proporsional di website.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* General Settings */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Informasi Klinik
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Nama Klinik
                            </label>
                            <input
                                type="text"
                                name="nama_klinik"
                                value={settings.nama_klinik}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                No. Telepon
                            </label>
                            <input
                                type="text"
                                name="telepon"
                                value={settings.telepon}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="0812-xxxx-xxxx"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={settings.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="info@makulabahalap.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Jam Operasional
                            </label>
                            <input
                                type="text"
                                name="jam_operasional"
                                value={settings.jam_operasional}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="Senin - Sabtu: 08:00 - 17:00"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Alamat Lengkap
                        </label>
                        <textarea
                            name="alamat"
                            value={settings.alamat}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none"
                            placeholder="Jl. Contoh No. 123, Kota"
                        />
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Google Maps Embed URL
                        </label>
                        <input
                            type="text"
                            name="google_maps_embed"
                            value={settings.google_maps_embed}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            placeholder="https://www.google.com/maps/embed?pb=..."
                        />
                        <p className="mt-1 text-xs text-gray-500">Paste embed URL dari Google Maps</p>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-brand-500 rounded-xl hover:bg-brand-600 transition disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Simpan Pengaturan
                            </>
                        )}
                    </button>
                </div>
            </form>
        </>
    );
}

