import { useState, useEffect } from "react";
import { apiPost } from "../lib/api";

interface PatientFormData {
    nm_pasien: string;
    no_ktp: string;
    jk: "L" | "P";
    tmp_lahir: string;
    tgl_lahir: string;
    nm_ibu: string;
    alamat: string;
    gol_darah: string;
    pekerjaan: string;
    stts_nikah: string;
    agama: string;
    no_tlp: string;
    pnd: string;
    keluarga: string;
    namakeluarga: string;
    kd_pj: string;
}

interface PatientRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (noRkmMedis: string) => void;
    bookingId: string;
    initialData: {
        nama: string;
        nik: string;
        telepon: string;
        alamat: string;
    };
}

const AGAMA_OPTIONS = ["ISLAM", "KRISTEN", "PROTESTAN", "HINDU", "BUDHA", "KONGHUCU", "LAINNYA"];
const GOL_DARAH_OPTIONS = ["-", "A", "B", "O", "AB"];
const STTS_NIKAH_OPTIONS = ["BELUM MENIKAH", "MENIKAH", "JANDA", "DUDHA"];
const PND_OPTIONS = ["-", "TS", "TK", "SD", "SMP", "SMA", "SLTA/SEDERAJAT", "D1", "D2", "D3", "D4", "S1", "S2", "S3"];
const KELUARGA_OPTIONS = ["DIRI SENDIRI", "AYAH", "IBU", "ISTRI", "SUAMI", "SAUDARA", "ANAK", "LAIN-LAIN"];
const KD_PJ_OPTIONS = [
    { value: "UMU", label: "Umum" },
    { value: "BPJ", label: "BPJS" },
];

// Parse NIK to extract birth date and gender
function parseNikInfo(nik: string): { tglLahir: string; jenisKelamin: "L" | "P" } {
    if (nik.length < 12) return { tglLahir: "", jenisKelamin: "L" };

    const day = parseInt(nik.substring(6, 8));
    const month = parseInt(nik.substring(8, 10));
    let year = parseInt(nik.substring(10, 12));

    const currentYear = new Date().getFullYear() % 100;
    year = year > currentYear ? 1900 + year : 2000 + year;

    const jenisKelamin: "L" | "P" = day > 40 ? "P" : "L";
    const actualDay = day > 40 ? day - 40 : day;

    const tglLahir = `${year}-${String(month).padStart(2, "0")}-${String(actualDay).padStart(2, "0")}`;

    return { tglLahir, jenisKelamin };
}

export default function PatientRegistrationModal({
    isOpen,
    onClose,
    onSuccess,
    bookingId,
    initialData,
}: PatientRegistrationModalProps) {
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<PatientFormData>(() => {
        const nikInfo = parseNikInfo(initialData.nik || "");
        return {
            nm_pasien: initialData.nama?.toUpperCase() || "",
            no_ktp: initialData.nik || "",
            jk: nikInfo.jenisKelamin,
            tmp_lahir: "",
            tgl_lahir: nikInfo.tglLahir,
            nm_ibu: "",
            alamat: initialData.alamat || "",
            gol_darah: "-",
            pekerjaan: "",
            stts_nikah: "BELUM MENIKAH",
            agama: "ISLAM",
            no_tlp: initialData.telepon || "",
            pnd: "-",
            keluarga: "DIRI SENDIRI",
            namakeluarga: initialData.nama?.toUpperCase() || "",
            kd_pj: "UMU",
        };
    });

    useEffect(() => {
        if (isOpen) {
            const nikInfo = parseNikInfo(initialData.nik || "");
            setFormData({
                nm_pasien: initialData.nama?.toUpperCase() || "",
                no_ktp: initialData.nik || "",
                jk: nikInfo.jenisKelamin,
                tmp_lahir: "",
                tgl_lahir: nikInfo.tglLahir,
                nm_ibu: "",
                alamat: initialData.alamat || "",
                gol_darah: "-",
                pekerjaan: "",
                stts_nikah: "BELUM MENIKAH",
                agama: "ISLAM",
                no_tlp: initialData.telepon || "",
                pnd: "-",
                keluarga: "DIRI SENDIRI",
                namakeluarga: initialData.nama?.toUpperCase() || "",
                kd_pj: "UMU",
            });
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.nm_pasien || !formData.no_ktp || !formData.tgl_lahir || !formData.nm_ibu || !formData.namakeluarga) {
            alert("Lengkapi semua field yang wajib diisi (*)");
            return;
        }

        setSaving(true);
        const response = await apiPost<{ no_rkm_medis: string }>(`/booking/${bookingId}/patient`, formData);
        if (response.success && response.data) {
            onSuccess(response.data.no_rkm_medis);
            onClose();
        } else {
            alert(`Gagal mendaftarkan pasien: ${response.error || response.message}`);
        }
        setSaving(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            Daftarkan Pasien ke SIMRS
                        </h3>
                        <p className="text-sm text-gray-500">Lengkapi data untuk mendapatkan No. Rekam Medis</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nama Pasien */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Nama Pasien *</label>
                            <input
                                type="text"
                                name="nm_pasien"
                                value={formData.nm_pasien}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm uppercase"
                                required
                            />
                        </div>

                        {/* NIK */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">NIK *</label>
                            <input
                                type="text"
                                name="no_ktp"
                                value={formData.no_ktp}
                                onChange={handleChange}
                                maxLength={16}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
                                required
                            />
                        </div>

                        {/* Jenis Kelamin */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Jenis Kelamin *</label>
                            <select
                                name="jk"
                                value={formData.jk}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
                                required
                            >
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </select>
                        </div>

                        {/* Tempat Lahir */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Tempat Lahir</label>
                            <input
                                type="text"
                                name="tmp_lahir"
                                value={formData.tmp_lahir}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
                            />
                        </div>

                        {/* Tanggal Lahir */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Lahir *</label>
                            <input
                                type="date"
                                name="tgl_lahir"
                                value={formData.tgl_lahir}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
                                required
                            />
                        </div>

                        {/* Nama Ibu Kandung */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Nama Ibu Kandung *</label>
                            <input
                                type="text"
                                name="nm_ibu"
                                value={formData.nm_ibu}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm uppercase"
                                required
                            />
                        </div>

                        {/* Agama */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Agama</label>
                            <select
                                name="agama"
                                value={formData.agama}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
                            >
                                {AGAMA_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        {/* Alamat */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Alamat</label>
                            <input
                                type="text"
                                name="alamat"
                                value={formData.alamat}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
                            />
                        </div>

                        {/* Golongan Darah */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Golongan Darah</label>
                            <select
                                name="gol_darah"
                                value={formData.gol_darah}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
                            >
                                {GOL_DARAH_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status Nikah */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Status Nikah</label>
                            <select
                                name="stts_nikah"
                                value={formData.stts_nikah}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
                            >
                                {STTS_NIKAH_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        {/* Pekerjaan */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Pekerjaan</label>
                            <input
                                type="text"
                                name="pekerjaan"
                                value={formData.pekerjaan}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
                            />
                        </div>

                        {/* Pendidikan */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Pendidikan</label>
                            <select
                                name="pnd"
                                value={formData.pnd}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
                            >
                                {PND_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        {/* No Telepon */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">No. Telepon</label>
                            <input
                                type="text"
                                name="no_tlp"
                                value={formData.no_tlp}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
                            />
                        </div>

                        {/* Jenis Penjamin */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Jenis Penjamin *</label>
                            <select
                                name="kd_pj"
                                value={formData.kd_pj}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
                                required
                            >
                                {KD_PJ_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Hubungan Keluarga */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Hubungan Penanggung Jawab</label>
                            <select
                                name="keluarga"
                                value={formData.keluarga}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
                            >
                                {KELUARGA_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        {/* Nama Penanggung Jawab */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Nama Penanggung Jawab *</label>
                            <input
                                type="text"
                                name="namakeluarga"
                                value={formData.namakeluarga}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm uppercase"
                                required
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
                        >
                            {saving ? "Mendaftarkan..." : "Daftarkan Pasien"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
