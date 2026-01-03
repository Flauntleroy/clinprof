import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import { apiGet, apiPut } from "../../lib/api";

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

export default function KontenTentang() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [content, setContent] = useState<TentangContent>(defaultContent);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                const response = await apiGet<{ nilai: TentangContent }>("/konten?kunci=tentang");
                if (response.success && response.data?.nilai) {
                    const fetchedContent = response.data.nilai;
                    setContent({
                        heading: fetchedContent.heading || defaultContent.heading,
                        subheading: fetchedContent.subheading || defaultContent.subheading,
                        paragraph1: fetchedContent.paragraph1 || defaultContent.paragraph1,
                        paragraph2: fetchedContent.paragraph2 || defaultContent.paragraph2,
                        features: Array.isArray(fetchedContent.features) ? fetchedContent.features : defaultContent.features,
                    });
                }
            } catch (err) {
                console.error("Failed to fetch tentang content:", err);
            }
            setLoading(false);
        };
        fetchContent();
    }, []);

    const handleChange = (field: keyof TentangContent, value: string) => {
        setContent((prev) => ({ ...prev, [field]: value }));
        setError("");
        setSuccess("");
    };

    const handleFeatureChange = (index: number, field: keyof Feature, value: string) => {
        setContent((prev) => {
            const newFeatures = [...prev.features];
            newFeatures[index] = { ...newFeatures[index], [field]: value };
            return { ...prev, features: newFeatures };
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
                kunci: "tentang",
                nilai: content,
            });
            if (response.success) {
                setSuccess("Konten Tentang Kami berhasil disimpan!");
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
            <PageMeta title="Edit Tentang Kami | Makula Bahalap" />
            <PageBreadcrumb pageTitle="Tentang Kami" />

            <div className="space-y-6">
                {/* Preview Card */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 dark:border-gray-800 dark:bg-gray-900">
                    <h3 className="text-sm font-medium text-gray-400 mb-6 uppercase tracking-wider">Preview</h3>
                    <div className="grid lg:grid-cols-2 gap-8 items-start">
                        {/* Image Mockup */}
                        <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                            <svg className="w-20 h-20 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                            </svg>
                            <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 hidden md:flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="text-[10px] font-bold text-brand-700 leading-tight tracking-tight">Bersertifikat<br /><span className="text-gray-400 font-normal">Internasional</span></div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 bg-brand-500/10 rounded-full px-3 py-1">
                                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                                <span className="text-[10px] font-bold text-brand-500 uppercase">Tentang Kami</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {content.heading} <span className="text-brand-500">{content.subheading}</span>
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed italic border-l-2 border-brand-200 pl-4">
                                {content.paragraph1}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                {content.paragraph2}
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                {content.features?.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <div className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate">{f.title}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
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

                        {/* Heading */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Heading
                                </label>
                                <input
                                    type="text"
                                    value={content.heading}
                                    onChange={(e) => handleChange("heading", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Subheading (Highlight)
                                </label>
                                <input
                                    type="text"
                                    value={content.subheading}
                                    onChange={(e) => handleChange("subheading", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Paragraphs */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Paragraf 1
                            </label>
                            <textarea
                                value={content.paragraph1}
                                onChange={(e) => handleChange("paragraph1", e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Paragraf 2
                            </label>
                            <textarea
                                value={content.paragraph2}
                                onChange={(e) => handleChange("paragraph2", e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none"
                            />
                        </div>

                        {/* Features */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">
                                Fitur Unggulan
                            </label>
                            <div className="grid md:grid-cols-2 gap-4">
                                {content.features?.map((feature, index) => (
                                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Judul</label>
                                            <input
                                                type="text"
                                                value={feature.title}
                                                onChange={(e) => handleFeatureChange(index, "title", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Deskripsi</label>
                                            <input
                                                type="text"
                                                value={feature.description}
                                                onChange={(e) => handleFeatureChange(index, "description", e.target.value)}
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
