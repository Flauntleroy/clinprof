import { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/dashboard/common/PageBreadcrumb";
import PageMeta from "@/components/dashboard/common/PageMeta";
import { apiGet, apiPut } from "@/lib/dashboard/api";

interface Dokter {
    id: string;
    nama: string;
}

interface Jadwal {
    id: string;
    dokter_id: string;
    dokter_nama?: string;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    is_active: boolean;
}

const HARI_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function JadwalDokter() {
    const [jadwal, setJadwal] = useState<Jadwal[]>([]);
    const [doctors, setDoctors] = useState<Dokter[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    const [form, setForm] = useState({
        dokter_id: "",
        hari: "Senin",
        jam_mulai: "08:00",
        jam_selesai: "17:00",
        is_active: true,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);

        // Fetch doctors
        const dokterRes = await apiGet<{ items: Dokter[] }>("/dokter");
        if (dokterRes.success && dokterRes.data) {
            setDoctors(dokterRes.data.items);
        }

        // Fetch jadwal - for now, we'll simulate with local data since API might not exist yet
        // In production, you'd fetch from /api/v1/jadwal
        setJadwal([]);

        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        // Find doctor name
        const doctor = doctors.find(d => d.id === form.dokter_id);

        if (editId) {
            // Update existing
            const response = await apiPut(`/jadwal/${editId}`, form);
            if (response.success) {
                setJadwal(prev => prev.map(j =>
                    j.id === editId ? { ...j, ...form, dokter_nama: doctor?.nama } : j
                ));
            }
        } else {
            // Create new (simulate for now)
            const newJadwal: Jadwal = {
                id: Date.now().toString(),
                ...form,
                dokter_nama: doctor?.nama,
            };
            setJadwal(prev => [...prev, newJadwal]);
        }

        resetForm();
        setSaving(false);
    };

    const handleEdit = (item: Jadwal) => {
        setForm({
            dokter_id: item.dokter_id,
            hari: item.hari,
            jam_mulai: item.jam_mulai,
            jam_selesai: item.jam_selesai,
            is_active: item.is_active,
        });
        setEditId(item.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus jadwal ini?")) return;
        setJadwal(prev => prev.filter(j => j.id !== id));
    };

    const resetForm = () => {
        setForm({
            dokter_id: "",
            hari: "Senin",
            jam_mulai: "08:00",
            jam_selesai: "17:00",
            is_active: true,
        });
        setEditId(null);
        setShowForm(false);
    };

    // Note: jadwalByDoctor grouping available if needed for alternative view
    // const jadwalByDoctor = jadwal.reduce(...);

    return (
        <>
            <PageMeta title="Jadwal Dokter | Makula Bahalap" />
            <PageBreadcrumb pageTitle="Jadwal Dokter" />

            <div className="space-y-6">
                {/* Add Button */}
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Jadwal
                    </button>
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                {editId ? "Edit Jadwal" : "Tambah Jadwal"}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        Dokter
                                    </label>
                                    <select
                                        value={form.dokter_id}
                                        onChange={(e) => setForm({ ...form, dokter_id: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    >
                                        <option value="">Pilih Dokter</option>
                                        {doctors.map(d => (
                                            <option key={d.id} value={d.id}>{d.nama}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        Hari
                                    </label>
                                    <select
                                        value={form.hari}
                                        onChange={(e) => setForm({ ...form, hari: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        {HARI_LIST.map(h => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                            Jam Mulai
                                        </label>
                                        <input
                                            type="time"
                                            value={form.jam_mulai}
                                            onChange={(e) => setForm({ ...form, jam_mulai: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                            Jam Selesai
                                        </label>
                                        <input
                                            type="time"
                                            value={form.jam_selesai}
                                            onChange={(e) => setForm({ ...form, jam_selesai: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={form.is_active}
                                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                        className="w-5 h-5 text-brand-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-200">Jadwal Aktif</span>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50"
                                    >
                                        {saving ? "Menyimpan..." : "Simpan"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Schedule Display */}
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Jadwal Praktik Dokter
                        </h3>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                        </div>
                    ) : jadwal.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p>Belum ada jadwal</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="mt-2 text-brand-500 hover:underline"
                            >
                                Tambah jadwal pertama
                            </button>
                        </div>
                    ) : (
                        <div className="p-6">
                            {/* Weekly Schedule Grid */}
                            <div className="grid grid-cols-7 gap-2">
                                {HARI_LIST.map(hari => (
                                    <div key={hari} className="text-center">
                                        <div className="font-medium text-gray-800 dark:text-white/90 py-2 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
                                            {hari.slice(0, 3)}
                                        </div>
                                        <div className="min-h-[100px] border border-gray-200 dark:border-gray-700 rounded-b-lg p-2 space-y-1">
                                            {jadwal.filter(j => j.hari === hari).map(j => (
                                                <div
                                                    key={j.id}
                                                    className="text-xs p-2 bg-brand-50 dark:bg-brand-900/20 rounded cursor-pointer hover:bg-brand-100 group relative"
                                                    onClick={() => handleEdit(j)}
                                                >
                                                    <p className="font-medium text-brand-700 dark:text-brand-300 truncate">
                                                        {j.dokter_nama}
                                                    </p>
                                                    <p className="text-brand-500/70">
                                                        {j.jam_mulai}-{j.jam_selesai}
                                                    </p>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(j.id); }}
                                                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}



