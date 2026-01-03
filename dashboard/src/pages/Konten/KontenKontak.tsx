import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import { apiGet, apiPut } from "../../lib/api";

interface JamOperasional {
    hari: string;
    jam: string;
    tutup: boolean;
}

interface KontakContent {
    alamat: string;
    telepon: string;
    whatsapp: string;
    email: string;
    google_maps_embed: string;
    jam_operasional: JamOperasional[];
}

const defaultContent: KontakContent = {
    alamat: "Jl. Contoh No. 123, Kota, Indonesia 12345",
    telepon: "0812-3456-7890",
    whatsapp: "6281234567890",
    email: "info@makulabahalap.com",
    google_maps_embed: "",
    jam_operasional: [
        { hari: "Senin - Jumat", jam: "08:00 - 17:00", tutup: false },
        { hari: "Sabtu", jam: "08:00 - 14:00", tutup: false },
        { hari: "Minggu", jam: "Tutup", tutup: true },
    ],
};

export default function KontenKontak() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [content, setContent] = useState<KontakContent>(defaultContent);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                const response = await apiGet<{ nilai: KontakContent }>("/konten?kunci=kontak");
                if (response.success && response.data?.nilai) {
                    const fetchedContent = response.data.nilai;
                    setContent({
                        alamat: fetchedContent.alamat || defaultContent.alamat,
                        telepon: fetchedContent.telepon || defaultContent.telepon,
                        whatsapp: fetchedContent.whatsapp || defaultContent.whatsapp,
                        email: fetchedContent.email || defaultContent.email,
                        google_maps_embed: fetchedContent.google_maps_embed || defaultContent.google_maps_embed,
                        jam_operasional: Array.isArray(fetchedContent.jam_operasional) ? fetchedContent.jam_operasional : defaultContent.jam_operasional,
                    });
                }
            } catch (err) {
                console.error("Failed to fetch kontak content:", err);
            }
            setLoading(false);
        };
        fetchContent();
    }, []);

    const handleChange = (field: keyof KontakContent, value: string) => {
        setContent((prev) => ({ ...prev, [field]: value }));
        setError("");
        setSuccess("");
    };

    const handleJamChange = (index: number, field: keyof JamOperasional, value: string | boolean) => {
        setContent((prev) => {
            const newJam = [...prev.jam_operasional];
            newJam[index] = { ...newJam[index], [field]: value };
            return { ...prev, jam_operasional: newJam };
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
                kunci: "kontak",
                nilai: content,
            });
            if (response.success) {
                setSuccess("Informasi Kontak berhasil disimpan!");
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
            <PageMeta title="Edit Informasi Kontak | Makula Bahalap" />
            <PageBreadcrumb pageTitle="Informasi Kontak" />

            <div className="space-y-6">
                {/* Preview Card */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 dark:border-gray-800 dark:bg-gray-900">
                    <h3 className="text-sm font-medium text-gray-400 mb-6 uppercase tracking-wider">Preview</h3>
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Address & Contact Info */}
                        <div className="lg:col-span-1 space-y-4">
                            {/* Alamat */}
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Alamat</div>
                                        <div className="text-xs text-gray-700 dark:text-gray-300 leading-normal">{content.alamat}</div>
                                    </div>
                                </div>
                            </div>
                            {/* Kontak */}
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500 flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Hubungi Kami</div>
                                        <div className="text-xs text-brand-600 font-bold mb-0.5">{content.telepon}</div>
                                        <div className="text-[10px] text-green-600 font-medium">WA: {content.whatsapp}</div>
                                    </div>
                                </div>
                            </div>
                            {/* Jam */}
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Jam Operasional</div>
                                        <div className="space-y-1.5">
                                            {content.jam_operasional?.map((j, i) => (
                                                <div key={i} className="flex justify-between text-[11px]">
                                                    <span className="text-gray-500">{j.hari}</span>
                                                    <span className={`font-bold ${j.tutup ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>{j.tutup ? 'Tutup' : j.jam}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map Preview */}
                        <div className="lg:col-span-2">
                            <div className="h-full min-h-[250px] bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 relative">
                                {content.google_maps_embed ? (
                                    <iframe
                                        src={content.google_maps_embed}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0, minHeight: '250px' }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Google Maps"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                        <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <h4 className="text-sm font-bold text-gray-400 capitalize">Lokasi Peta</h4>
                                        <p className="text-xs text-gray-400 max-w-[200px] mt-1">Embed Google Maps akan tampil di sini</p>
                                    </div>
                                )}
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

                        {/* Alamat */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Alamat Lengkap
                            </label>
                            <textarea
                                value={content.alamat}
                                onChange={(e) => handleChange("alamat", e.target.value)}
                                rows={2}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none"
                            />
                        </div>

                        {/* Contact Info */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    No. Telepon
                                </label>
                                <input
                                    type="text"
                                    value={content.telepon}
                                    onChange={(e) => handleChange("telepon", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    placeholder="0812-xxxx-xxxx"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    WhatsApp (tanpa +)
                                </label>
                                <input
                                    type="text"
                                    value={content.whatsapp}
                                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    placeholder="6281234567890"
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    placeholder="info@makulabahalap.com"
                                />
                            </div>
                        </div>

                        {/* Jam Operasional */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">
                                Jam Operasional
                            </label>
                            <div className="space-y-3">
                                {content.jam_operasional?.map((jam, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={jam.hari}
                                                onChange={(e) => handleJamChange(index, "hari", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                placeholder="Hari"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={jam.jam}
                                                onChange={(e) => handleJamChange(index, "jam", e.target.value)}
                                                disabled={jam.tutup}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                                                placeholder="08:00 - 17:00"
                                            />
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={jam.tutup}
                                                onChange={(e) => handleJamChange(index, "tutup", e.target.checked)}
                                                className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
                                            />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Tutup</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Google Maps */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Google Maps Embed URL
                            </label>
                            <input
                                type="text"
                                value={content.google_maps_embed}
                                onChange={(e) => handleChange("google_maps_embed", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="https://www.google.com/maps/embed?pb=..."
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Paste embed URL dari Google Maps. Buka Google Maps → Share → Embed a map → Copy src URL
                            </p>
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
