import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import { useToast } from "../../context/ToastContext";
import { apiGet, apiPut } from "../../lib/api";

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

const defaultContent: FooterContent = {
    deskripsi: "Klinik Spesialis Mata terpercaya dengan pelayanan prima dan teknologi modern.",
    alamat: "Jl. Contoh No. 123, Kota, Indonesia",
    telepon: "0812-3456-7890",
    email: "info@makulabahalap.com",
    social_links: [
        { platform: "Facebook", url: "https://facebook.com/makulabahalap", enabled: true },
        { platform: "Instagram", url: "https://instagram.com/makulabahalap", enabled: true },
        { platform: "WhatsApp", url: "https://wa.me/6281234567890", enabled: true },
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

export default function KontenFooter() {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [content, setContent] = useState<FooterContent>(defaultContent);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                const response = await apiGet<{ nilai: FooterContent }>("/konten?kunci=footer");
                if (response.success && response.data?.nilai) {
                    const fetchedContent = response.data.nilai;
                    setContent({
                        deskripsi: fetchedContent.deskripsi || defaultContent.deskripsi,
                        alamat: fetchedContent.alamat || defaultContent.alamat,
                        telepon: fetchedContent.telepon || defaultContent.telepon,
                        email: fetchedContent.email || defaultContent.email,
                        social_links: Array.isArray(fetchedContent.social_links) ? fetchedContent.social_links : defaultContent.social_links,
                        layanan_list: Array.isArray(fetchedContent.layanan_list) ? fetchedContent.layanan_list : defaultContent.layanan_list,
                        copyright_text: fetchedContent.copyright_text || defaultContent.copyright_text,
                    });
                }
            } catch (err) {
                console.error("Failed to fetch footer content:", err);
            }
            setLoading(false);
        };
        fetchContent();
    }, []);

    const handleChange = (field: keyof FooterContent, value: string) => {
        setContent((prev) => ({ ...prev, [field]: value }));
    };

    const handleSocialChange = (index: number, field: keyof SocialLink, value: string | boolean) => {
        setContent((prev) => {
            const newSocial = [...prev.social_links];
            newSocial[index] = { ...newSocial[index], [field]: value };
            return { ...prev, social_links: newSocial };
        });
    };

    const handleLayananChange = (index: number, value: string) => {
        setContent((prev) => {
            const newLayanan = [...prev.layanan_list];
            newLayanan[index] = { nama: value };
            return { ...prev, layanan_list: newLayanan };
        });
    };

    const addLayanan = () => {
        setContent((prev) => ({
            ...prev,
            layanan_list: [...prev.layanan_list, { nama: "" }],
        }));
    };

    const removeLayanan = (index: number) => {
        setContent((prev) => ({
            ...prev,
            layanan_list: prev.layanan_list.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await apiPut("/konten", {
                kunci: "footer",
                nilai: content,
            });
            if (response.success) {
                addToast("success", "Konten footer berhasil disimpan!", "Berhasil");
            } else {
                addToast("error", response.error || "Gagal menyimpan konten", "Gagal");
            }
        } catch {
            addToast("error", "Terjadi kesalahan saat menyimpan", "Gagal");
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    return (
        <>
            <PageMeta title="Kelola Footer | Makula Bahalap" />
            <PageBreadcrumb pageTitle="Konten Footer" />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Info Umum */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Informasi Umum
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Deskripsi Klinik
                            </label>
                            <textarea
                                value={content.deskripsi}
                                onChange={(e) => handleChange("deskripsi", e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="Deskripsi singkat klinik"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Copyright Text
                            </label>
                            <input
                                type="text"
                                value={content.copyright_text}
                                onChange={(e) => handleChange("copyright_text", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="© 2024 Nama Klinik..."
                            />
                        </div>
                    </div>
                </div>

                {/* Kontak Footer */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Informasi Kontak
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Alamat
                            </label>
                            <input
                                type="text"
                                value={content.alamat}
                                onChange={(e) => handleChange("alamat", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="Alamat lengkap klinik"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Telepon
                            </label>
                            <input
                                type="text"
                                value={content.telepon}
                                onChange={(e) => handleChange("telepon", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="0812-3456-7890"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={content.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="info@example.com"
                            />
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                        Sosial Media
                    </h3>

                    <div className="space-y-4">
                        {content.social_links.map((social, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <div className="flex-shrink-0 w-24">
                                    <span className="font-medium text-gray-700 dark:text-gray-200">{social.platform}</span>
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="url"
                                        value={social.url}
                                        onChange={(e) => handleSocialChange(index, "url", e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
                                        placeholder={`URL ${social.platform}`}
                                    />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={social.enabled}
                                        onChange={(e) => handleSocialChange(index, "enabled", e.target.checked)}
                                        className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Aktif</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Layanan List */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                            <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Daftar Layanan (Footer)
                        </h3>
                        <button
                            type="button"
                            onClick={addLayanan}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Tambah
                        </button>
                    </div>

                    <div className="space-y-3">
                        {content.layanan_list.map((layanan, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {index + 1}
                                </span>
                                <input
                                    type="text"
                                    value={layanan.nama}
                                    onChange={(e) => handleLayananChange(index, e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    placeholder="Nama layanan"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeLayanan(index)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        {content.layanan_list.length === 0 && (
                            <p className="text-center text-gray-500 py-4">Belum ada layanan. Klik "Tambah" untuk menambahkan.</p>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-3 font-medium text-white bg-brand-500 rounded-xl hover:bg-brand-600 transition disabled:opacity-50"
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
                                Simpan Perubahan
                            </>
                        )}
                    </button>
                </div>
            </form>
        </>
    );
}
