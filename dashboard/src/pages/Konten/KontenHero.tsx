import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import { apiGet, apiPut } from "../../lib/api";

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

export default function KontenHero() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [content, setContent] = useState<HeroContent>(defaultContent);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                const response = await apiGet<{ nilai: HeroContent }>("/konten?kunci=hero");
                if (response.success && response.data?.nilai) {
                    // Ensure data has proper structure with fallback to defaults
                    const fetchedContent = response.data.nilai;
                    setContent({
                        badge: fetchedContent.badge || defaultContent.badge,
                        title_line1: fetchedContent.title_line1 || defaultContent.title_line1,
                        title_line2: fetchedContent.title_line2 || defaultContent.title_line2,
                        subtitle: fetchedContent.subtitle || defaultContent.subtitle,
                        stats: Array.isArray(fetchedContent.stats) ? fetchedContent.stats : defaultContent.stats,
                    });
                }
            } catch (err) {
                console.error("Failed to fetch hero content:", err);
            }
            setLoading(false);
        };
        fetchContent();
    }, []);

    const handleChange = (field: keyof HeroContent, value: string) => {
        setContent((prev) => ({ ...prev, [field]: value }));
        setError("");
        setSuccess("");
    };

    const handleStatChange = (index: number, field: "value" | "label", value: string) => {
        setContent((prev) => {
            const newStats = [...prev.stats];
            newStats[index] = { ...newStats[index], [field]: value };
            return { ...prev, stats: newStats };
        });
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const response = await apiPut("/konten", {
                kunci: "hero",
                nilai: content,
            });
            if (response.success) {
                setSuccess("Konten Hero berhasil disimpan!");
            } else {
                setError(response.error || "Gagal menyimpan konten");
            }
        } catch {
            setError("Terjadi kesalahan saat menyimpan");
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
            <PageMeta title="Edit Hero Section | Makula Bahalap" />
            <PageBreadcrumb pageTitle="Hero Section" />

            <div className="space-y-6">
                {/* Preview Card */}
                <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white dark:border-gray-800">
                    <h3 className="text-sm font-medium text-blue-200 mb-4">Preview</h3>
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-4">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                            <span className="text-sm">{content.badge}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            <span className="block">{content.title_line1}</span>
                            <span className="text-yellow-400">{content.title_line2}</span>
                        </h1>
                        <p className="text-white/80 max-w-xl mx-auto mb-8">{content.subtitle}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {content.stats.map((stat, index) => (
                                <div key={index} className="bg-white/10 rounded-xl p-4">
                                    <div className="text-2xl font-bold text-yellow-400">{stat.value}</div>
                                    <div className="text-xs text-white/70">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Edit Konten</h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {success && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                                {success}
                            </div>
                        )}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                {error}
                            </div>
                        )}

                        {/* Badge */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Badge Text
                            </label>
                            <input
                                type="text"
                                value={content.badge}
                                onChange={(e) => handleChange("badge", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                        </div>

                        {/* Titles */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Judul Baris 1
                                </label>
                                <input
                                    type="text"
                                    value={content.title_line1}
                                    onChange={(e) => handleChange("title_line1", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Judul Baris 2 (Highlight)
                                </label>
                                <input
                                    type="text"
                                    value={content.title_line2}
                                    onChange={(e) => handleChange("title_line2", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Subtitle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Subtitle / Deskripsi
                            </label>
                            <textarea
                                value={content.subtitle}
                                onChange={(e) => handleChange("subtitle", e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none"
                            />
                        </div>

                        {/* Statistics */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">
                                Statistik
                            </label>
                            <div className="grid md:grid-cols-2 gap-4">
                                {content.stats.map((stat, index) => (
                                    <div key={index} className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-500 mb-1">Nilai</label>
                                            <input
                                                type="text"
                                                value={stat.value}
                                                onChange={(e) => handleStatChange(index, "value", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-lg font-bold"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-500 mb-1">Label</label>
                                            <input
                                                type="text"
                                                value={stat.label}
                                                onChange={(e) => handleStatChange(index, "label", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Menyimpan...
                                    </>
                                ) : (
                                    "Simpan Perubahan"
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setContent(defaultContent)}
                                className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Reset ke Default
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
