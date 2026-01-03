import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import { apiGet, apiPost, apiPut, apiUpload, getMediaUrl } from "../../lib/api";

interface DokterForm {
    nama: string;
    spesialisasi: string;
    foto: string;
    bio: string;
    no_str: string;
    is_active: boolean;
    urutan: number;
}

interface Props {
    isEdit?: boolean;
}

export default function DokterForm({ isEdit = false }: Props) {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState<DokterForm>({
        nama: "",
        spesialisasi: "",
        foto: "",
        bio: "",
        no_str: "",
        is_active: true,
        urutan: 0,
    });

    // Fetch existing data if editing
    useEffect(() => {
        if (isEdit && id) {
            const fetchData = async () => {
                setLoading(true);
                const response = await apiGet<DokterForm>(`/dokter/${id}`);
                if (response.success && response.data) {
                    setForm({
                        nama: response.data.nama || "",
                        spesialisasi: response.data.spesialisasi || "",
                        foto: response.data.foto || "",
                        bio: response.data.bio || "",
                        no_str: response.data.no_str || "",
                        is_active: response.data.is_active ?? true,
                        urutan: response.data.urutan || 0,
                    });
                } else {
                    setError("Gagal mengambil data dokter");
                }
                setLoading(false);
            };
            fetchData();
        }
    }, [isEdit, id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
        setError("");
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const response = await apiUpload(file);
        if (response.success && response.data) {
            setForm((prev) => ({ ...prev, foto: response.data!.url }));
        } else {
            setError(response.error || "Gagal mengupload foto");
        }
        setUploading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.nama || !form.spesialisasi) {
            setError("Nama dan spesialisasi wajib diisi");
            return;
        }

        setSaving(true);
        setError("");

        const response = isEdit
            ? await apiPut(`/dokter/${id}`, form)
            : await apiPost("/dokter", form);

        if (response.success) {
            navigate("/dokter");
        } else {
            setError(response.error || "Gagal menyimpan data dokter");
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
            <PageMeta title={`${isEdit ? "Edit" : "Tambah"} Dokter | Makula Bahalap`} />
            <PageBreadcrumb pageTitle={`${isEdit ? "Edit" : "Tambah"} Dokter`} />

            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Photo Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Foto Dokter
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                                {form.foto ? (
                                    <img src={getMediaUrl(form.foto)} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                                    {uploading ? (
                                        <>
                                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                                            Mengupload...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Upload Foto
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                </label>
                                <p className="mt-1 text-xs text-gray-500">JPG, PNG maksimal 5MB</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Nama Dokter *
                            </label>
                            <input
                                type="text"
                                name="nama"
                                value={form.nama}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="dr. Nama Lengkap, Sp.M"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Spesialisasi *
                            </label>
                            <input
                                type="text"
                                name="spesialisasi"
                                value={form.spesialisasi}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="Spesialis Mata"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                No. STR
                            </label>
                            <input
                                type="text"
                                name="no_str"
                                value={form.no_str}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="Nomor Surat Tanda Registrasi"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Urutan Tampil
                            </label>
                            <input
                                type="number"
                                name="urutan"
                                value={form.urutan}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                min="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Bio / Deskripsi
                        </label>
                        <textarea
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none"
                            placeholder="Pengalaman, keahlian, dan latar belakang dokter..."
                        />
                    </div>

                    {/* Status Toggle */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="is_active"
                            id="is_active"
                            checked={form.is_active}
                            onChange={handleChange}
                            className="w-5 h-5 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
                        />
                        <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-200">
                            Dokter aktif (tampil di website)
                        </label>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {isEdit ? "Simpan Perubahan" : "Tambah Dokter"}
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/dokter")}
                            className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
