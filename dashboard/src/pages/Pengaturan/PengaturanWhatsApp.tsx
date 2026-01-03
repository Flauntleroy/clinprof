import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import { apiGet, apiPut } from "../../lib/api";

export default function PengaturanWhatsApp() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const [settings, setSettings] = useState({
        fonnte_token: "",
        fonnte_device: "",
        wa_admin: "",
        wa_template_booking: "Halo {nama}! Booking Anda telah dikonfirmasi.\n\nKode: {kode}\nTanggal: {tanggal}\nWaktu: {waktu}\nDokter: {dokter}\n\nSampai jumpa di Makula Bahalap!",
    });

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            const response = await apiGet<{ nilai: any }>("/konten?kunci=whatsapp");
            if (response.success && response.data?.nilai) {
                setSettings((prev) => ({
                    ...prev,
                    ...response.data?.nilai
                }));
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
            await apiPut("/konten", {
                kunci: "whatsapp",
                nilai: settings
            });
            setSuccess("Pengaturan WhatsApp berhasil disimpan!");
        } catch {
            setError("Gagal menyimpan pengaturan");
        }
        setSaving(false);
    };

    const handleTestMessage = async () => {
        if (!settings.wa_admin || !settings.fonnte_token) {
            setError("Masukkan nomor admin dan token Fonnte terlebih dahulu");
            return;
        }

        setTesting(true);
        setError("");
        setSuccess("");

        try {
            const formData = new FormData();
            formData.append("target", settings.wa_admin);
            formData.append("message", "Ini adalah pesan percobaan dari Dashboard Makula Bahalap.");
            if (settings.fonnte_device) {
                formData.append("device", settings.fonnte_device);
            }

            const response = await fetch("https://api.fonnte.com/send", {
                method: "POST",
                headers: {
                    Authorization: settings.fonnte_token,
                },
                body: formData,
            });

            const result = await response.json();

            if (result.status) {
                setSuccess(`Pesan test berhasil dikirim ke ${settings.wa_admin}!`);
            } else {
                setError(`Fonnte Error: ${result.reason || "Gagal mengirim pesan"}`);
            }
        } catch (err) {
            setError("Gagal menghubungi server Fonnte");
        }
        setTesting(false);
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
            <PageMeta title="Pengaturan WhatsApp | Makula Bahalap" />
            <PageBreadcrumb pageTitle="Pengaturan WhatsApp" />

            <div className="space-y-6">
                {/* Info Card */}
                <div className="rounded-2xl bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Integrasi Fonnte API</h3>
                            <p className="text-white/80 text-sm">Notifikasi booking otomatis via WhatsApp</p>
                        </div>
                    </div>
                </div>

                {/* Settings Form */}
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
                                    Fonnte Token
                                </label>
                                <input
                                    type="password"
                                    name="fonnte_token"
                                    value={settings.fonnte_token}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    placeholder="Token dari Fonnte.com"
                                />
                                {settings.fonnte_token && (
                                    <div className="mt-2 text-[11px] font-mono text-gray-500 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded border border-gray-100 dark:border-gray-700 w-fit">
                                        <span className="font-bold text-gray-400 uppercase text-[9px]">Token Aktif:</span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {settings.fonnte_token.substring(0, Math.max(0, settings.fonnte_token.length - 6))}xxxxxx
                                        </span>
                                    </div>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Dapatkan token di <a href="https://fonnte.com" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">fonnte.com</a>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Device ID (Opsional)
                                </label>
                                <input
                                    type="text"
                                    name="fonnte_device"
                                    value={settings.fonnte_device}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    placeholder="ID perangkat Fonnte"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Nomor WhatsApp Admin
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    name="wa_admin"
                                    value={settings.wa_admin}
                                    onChange={handleChange}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    placeholder="08123456789"
                                />
                                <button
                                    type="button"
                                    onClick={handleTestMessage}
                                    disabled={testing}
                                    className="px-4 py-3 text-sm font-medium text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition disabled:opacity-50"
                                >
                                    {testing ? "Mengirim..." : "Test Pesan"}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Nomor untuk menerima notifikasi booking baru</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Template Pesan Konfirmasi Booking
                            </label>
                            <textarea
                                name="wa_template_booking"
                                value={settings.wa_template_booking}
                                onChange={handleChange}
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono text-sm"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Variabel: {"{nama}"}, {"{kode}"}, {"{tanggal}"}, {"{waktu}"}, {"{dokter}"}
                            </p>
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
            </div>
        </>
    );
}
