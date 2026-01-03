import { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/dashboard/common/PageBreadcrumb";
import PageMeta from "@/components/dashboard/common/PageMeta";
import { apiGet, apiPut } from "@/lib/dashboard/api";

interface Pengaturan {
    key: string;
    value: string;
}

export default function PengaturanUmum() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const [settings, setSettings] = useState({
        nama_klinik: "Klinik Spesialis Mata Makula Bahalap",
        alamat: "",
        telepon: "",
        email: "",
        jam_operasional: "Senin - Sabtu: 08:00 - 17:00",
        google_maps_embed: "",
    });

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            const response = await apiGet<{ items: Pengaturan[] }>("/konten");
            if (response.success && response.data) {
                const items = response.data.items || [];
                const newSettings = { ...settings };
                items.forEach((item) => {
                    if (item.key in newSettings) {
                        (newSettings as Record<string, string>)[item.key] = item.value;
                    }
                });
                setSettings(newSettings);
            }
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings((prev) => ({ ...prev, [name]: value }));
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            // Save each setting
            for (const [key, value] of Object.entries(settings)) {
                await apiPut("/konten", { key, value });
            }
            setSuccess("Pengaturan berhasil disimpan!");
        } catch {
            setError("Gagal menyimpan pengaturan");
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

                    <div>
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

                    <div>
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

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition disabled:opacity-50"
                        >
                            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}



