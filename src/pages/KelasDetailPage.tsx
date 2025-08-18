import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import * as api from "../lib/api";
import PageHeader from "../components/PageHeader";
import Section from "../components/Section";

export default function KelasDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [kelas, setKelas] = useState<api.Kelas | null>(null);
  const [assignedPakets, setAssignedPakets] = useState<api.Paket[]>([]);
  const [allPakets, setAllPakets] = useState<api.Paket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPaketId, setSelectedPaketId] = useState<number | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [kelasResponse, paketsResponse] = await Promise.all([
        api.getKelasById(parseInt(id)),
        api.getPaketsByKelas(parseInt(id)),
      ]);

      if (kelasResponse.success && kelasResponse.data) {
        setKelas(kelasResponse.data);
      } else {
        setError(kelasResponse.message || "Gagal memuat detail kelas");
      }

      if (paketsResponse.success && paketsResponse.data) {
        setAssignedPakets(paketsResponse.data);
      } else {
        if (!paketsResponse.success) {
          console.warn("Tidak dapat memuat paket:", paketsResponse.message);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const openAssignModal = async () => {
    try {
      const response = await api.getAllPakets();
      if (response.success && response.data) {
        // Filter out pakets that are already assigned to this class
        const unassigned = response.data.data.filter(
          (p: api.Paket) => !assignedPakets.some((ap) => ap.id === p.id)
        );
        setAllPakets(unassigned);
      } else {
        alert(response.message || "Gagal memuat daftar paket.");
      }
      setIsAssignModalOpen(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
      alert(message);
    }
  };

  const handleAssignPaket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaketId || !id) {
      alert("Silakan pilih paket terlebih dahulu.");
      return;
    }

    setIsAssigning(true);
    try {
      const response = await api.assignPaketToKelas({
        kelas_id: parseInt(id),
        paket_id: selectedPaketId,
      });

      if (response.success) {
        setIsAssignModalOpen(false);
        setSelectedPaketId(null);
        await fetchDetails(); // Refresh the list of assigned pakets
      } else {
        alert(response.message || "Gagal menugaskan paket.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
      alert(message);
    } finally {
      setIsAssigning(false);
    }
  };

  if (loading) {
    return <div className="p-6">Memuat...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!kelas) {
    return <div className="p-6">Kelas tidak ditemukan.</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <Link
            to="/kelas"
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
        </div>
        <PageHeader title="Detail Kelas" description={`ID Kelas #${kelas.id}`} />

        <Section>
          <div className="card mb-6">
            <div className="card-body">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {kelas.name}
              </h2>
              <p className="text-gray-600 mb-4">{kelas.description}</p>
              <p className="text-lg font-semibold text-gray-800">
                Harga: Rp{kelas.price.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Paket Ujian di Kelas Ini
                </h2>
                <button onClick={openAssignModal} className="btn btn-primary">
                  Tambahkan Paket
                </button>
              </div>
              <div className="overflow-x-auto">
                {assignedPakets.length > 0 ? (
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durasi (menit)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Soal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assignedPakets.map((paket, idx) => (
                        <tr
                          key={paket.id}
                          className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-50 transition-colors`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{paket.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{paket.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{paket.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
                              {paket.duration} menit
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{paket.total_questions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      Tidak ada paket ujian yang ditemukan untuk kelas ini.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Section>
      </div>

      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md mx-auto">
            <div className="card-body">
            <h2 className="text-xl font-bold mb-6">Tambahkan Paket ke Kelas</h2>
            <form onSubmit={handleAssignPaket}>
              <div className="mb-6">
                <label htmlFor="paket" className="label">
                  Pilih Paket
                </label>
                <select
                  id="paket"
                  value={selectedPaketId ?? ""}
                  onChange={(e) => setSelectedPaketId(parseInt(e.target.value))}
                  className="input w-full"
                  required
                  disabled={isAssigning}
                >
                  <option value="" disabled>
                    Pilih sebuah paket...
                  </option>
                  {allPakets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={isAssigning}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isAssigning}
                >
                  {isAssigning ? "Menambahkan..." : "Tambahkan"}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
