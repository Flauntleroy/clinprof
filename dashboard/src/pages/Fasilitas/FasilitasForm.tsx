import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import { apiGet, apiPost, apiPut, apiUpload, getMediaUrl } from "../../lib/api";

interface FasilitasForm {
    nama: string;
    deskripsi: string;
    foto: string;
    kategori: "FASILITAS" | "TEKNOLOGI";
    is_active: boolean;
    urutan: number;
}

interface Props {
    isEdit?: boolean;
}

export default function FasilitasForm({ isEdit = false }: Props) {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState<FasilitasForm>({
        nama: "",
        deskripsi: "",
        foto: "",
        kategori: "FASILITAS",
        is_active: true,
        urutan: 0,
    });

    useEffect(() => {
        if (isEdit && id) {
            const fetchData = async () => {
                setLoading(true);
                const response = await apiGet<FasilitasForm>(`/fasilitas/${id}`);
                if (response.success && response.data) {
                    setForm({
                        nama: response.data.nama || "",
                        deskripsi: response.data.deskripsi || "",
                        foto: response.data.foto || "",
                        kategori: response.data.kategori || "FASILITAS",
                        is_active: response.data.is_active ?? true,
                        urutan: response.data.urutan || 0,
                    });
                } else {
                    setError("Gagal mengambil data");
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

        if (!form.nama || !form.deskripsi) {
            setError("Nama dan deskripsi wajib diisi");
            return;
        }

        setSaving(true);
        setError("");

        const response = isEdit
            ? await apiPut(`/fasilitas/${id}`, form)
            : await apiPost("/fasilitas", form);

        if (response.success) {
            navigate("/fasilitas");
        } else {
            setError(response.error || "Gagal menyimpan data");
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
            <PageMeta title={`${isEdit ? "Edit" : "Tambah"} Fasilitas | Makula Bahalap`} />
            <PageBreadcrumb pageTitle={`${isEdit ? "Edit" : "Tambah"} Fasilitas/Teknologi`} />

            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Photo Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Foto
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="w-32 h-24 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                                {form.foto ? (
                                    <img src={getMediaUrl(form.foto)} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </div>
                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                                {uploading ? "Mengupload..." : "Upload Foto"}
                                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                            </label>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Nama *
                            </label>
                            <input
                                type="text"
                                name="nama"
                                value={form.nama}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="Contoh: Ruang Tunggu Nyaman"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Kategori *
                            </label>
                            <select
                                name="kategori"
                                value={form.kategori}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            >
                                <option value="FASILITAS">Fasilitas</option>
                                <option value="TEKNOLOGI">Teknologi Medis</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Deskripsi *
                        </label>
                        <textarea
                            name="deskripsi"
                            value={form.deskripsi}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none"
                            placeholder="Jelaskan fasilitas atau teknologi..."
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Urutan
                            </label>
                            <input
                                type="number"
                                name="urutan"
                                value={form.urutan}
                                onChange={handleChange}
                                className="w-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                min="0"
                            />
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer mt-6">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={form.is_active}
                                onChange={handleChange}
                                className="w-5 h-5 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-200">Aktif (tampil di website)</span>
                        </label>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition disabled:opacity-50"
                        >
                            {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Item"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/fasilitas")}
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
