import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import * as api from "../lib/api";
import PageHeader from "../components/PageHeader.tsx";
import Section from "../components/Section.tsx";
import { useToast } from "../utils/useToast";

export default function KelasDetailPage() {
  const { showSuccess, showError } = useToast();
  const { class_code } = useParams<{ class_code: string }>();
  const [kelas, setKelas] = useState<api.Kelas | null>(null);
  const [assignedPakets, setAssignedPakets] = useState<api.Paket[]>([]);
  const [allPakets, setAllPakets] = useState<api.Paket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPaketIds, setSelectedPaketIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [paketSearchQuery, setPaketSearchQuery] = useState("");
  const [removingPaketId, setRemovingPaketId] = useState<string | null>(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [paketToRemove, setPaketToRemove] = useState<api.Paket | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!class_code) return;
    setLoading(true);
    try {
      const [kelasResponse, paketsResponse] = await Promise.all([
        api.getKelasById(class_code),
        api.getPaketsByKelas(class_code),
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
  }, [class_code]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const openAssignModal = async () => {
    try {
      const response = await api.getAllPakets();
      if (response.success && response.data) {
        // Filter out pakets that are already assigned to this class
        const unassigned = response.data.data.filter(
          (p: api.Paket) =>
            !assignedPakets.some((ap) => ap.package_code === p.package_code) &&
            p.is_active !== 0,
        );
        setAllPakets(unassigned);
      } else {
        alert(response.message || "Gagal memuat daftar paket.");
      }
      setSelectedPaketIds([]);
      setPaketSearchQuery("");
      setIsAssignModalOpen(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
      alert(message);
    }
  };

  const handleAssignPaket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!class_code) return;

    if (selectedPaketIds.length === 0) {
      alert("Silakan pilih paket terlebih dahulu.");
      return;
    }

    setIsAssigning(true);
    try {
      for (const paketCode of selectedPaketIds) {
        const response = await api.assignPaketToKelas({
          class_code,
          package_code: paketCode,
        });

        if (!response.success) {
          throw new Error(response.message || "Gagal menugaskan paket.");
        }
      }

      setIsAssignModalOpen(false);
      setSelectedPaketIds([]);
      await fetchDetails(); // Refresh the list of assigned pakets
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
      alert(message);
    } finally {
      setIsAssigning(false);
    }
  };

  const togglePaketSelection = (paketCode: string) => {
    setSelectedPaketIds((prev) =>
      prev.includes(paketCode)
        ? prev.filter((code) => code !== paketCode)
        : [...prev, paketCode],
    );
  };

  const handleRemovePaket = (paket: api.Paket) => {
    setPaketToRemove(paket);
    setIsRemoveModalOpen(true);
  };

  const confirmRemovePaket = async () => {
    if (!class_code || !paketToRemove) return;

    setRemovingPaketId(paketToRemove.package_code);
    try {
      const response = await api.removePaketFromKelas({
        class_code,
        package_code: paketToRemove.package_code,
      });

      if (response?.success === false) {
        throw new Error(response.message || "Gagal menghapus paket.");
      }
      setAssignedPakets((prev) =>
        prev.filter((p) => p.package_code !== paketToRemove.package_code),
      );
      showSuccess("Paket berhasil dihapus dari kelas.");
      setIsRemoveModalOpen(false);
      setPaketToRemove(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
      showError(message);
    } finally {
      setRemovingPaketId(null);
    }
  };

  const filteredPakets = useMemo(() => {
    const query = paketSearchQuery.trim().toLowerCase();
    if (!query) return allPakets;
    return allPakets.filter((paket) => {
      const name = paket.name.toLowerCase();
      const kode = (paket.package_code || paket.kode_paket || "").toLowerCase();
      return `${name} ${kode}`.includes(query);
    });
  }, [allPakets, paketSearchQuery]);

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
        <PageHeader
          title="Detail Kelas"
          description={`Kode Kelas ${kelas.class_code}`}
        />

        <Section>
          <div className="card mb-6">
            <div className="card-body">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {kelas.name}
              </h2>
              <p className="text-sm text-gray-500 mb-2">
                Kode Kelas: {kelas.class_code}
              </p>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kode Paket
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nama
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deskripsi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Durasi (menit)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jumlah Soal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assignedPakets.map((paket, idx) => (
                        <tr
                          key={paket.package_code}
                          className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-50 transition-colors`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {paket.package_code || paket.kode_paket || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {paket.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {paket.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
                              {paket.duration} menit
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {paket.total_questions}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              type="button"
                              onClick={() => handleRemovePaket(paket)}
                              className="btn btn-danger btn-sm"
                              disabled={removingPaketId === paket.package_code}
                            >
                              {removingPaketId === paket.package_code
                                ? "Menghapus..."
                                : "Hapus"}
                            </button>
                          </td>
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md mx-auto">
            <div className="card-body">
              <h2 className="text-xl font-bold mb-6">
                Tambahkan Paket ke Kelas
              </h2>
              <form onSubmit={handleAssignPaket}>
                <div className="mb-6">
                  <label htmlFor="paket" className="label">
                    Pilih Paket
                  </label>
                  <input
                    type="text"
                    className="input w-full mb-3"
                    placeholder="Cari paket..."
                    value={paketSearchQuery}
                    onChange={(e) => setPaketSearchQuery(e.target.value)}
                    disabled={isAssigning}
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>{selectedPaketIds.length} paket dipilih</span>
                    <button
                      type="button"
                      onClick={() => setSelectedPaketIds([])}
                      className="text-primary-700 hover:text-primary-800"
                      disabled={isAssigning || selectedPaketIds.length === 0}
                    >
                      Bersihkan
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden max-h-72 overflow-y-auto">
                    {filteredPakets.map((paket) => {
                      const isSelected = selectedPaketIds.includes(
                        paket.package_code,
                      );
                      return (
                        <label
                          key={paket.package_code}
                          className={`flex gap-3 p-3 cursor-pointer border-b border-gray-200 last:border-b-0 transition-colors ${
                            isSelected ? "bg-primary-100" : "bg-white"
                          } hover:bg-gray-50`}
                        >
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={isSelected}
                            onChange={() =>
                              togglePaketSelection(paket.package_code)
                            }
                            disabled={isAssigning}
                          />
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-gray-900">
                                {paket.name}
                              </p>
                              {paket.kode_paket && (
                                <span className="text-xs text-gray-500">
                                  {paket.kode_paket}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {paket.description || "Tanpa deskripsi"}
                            </p>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                              <span>Durasi: {paket.duration} menit</span>
                              <span>Soal: {paket.total_questions}</span>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  {filteredPakets.length === 0 && (
                    <p className="helper-text text-gray-500 mt-2">
                      Tidak ada paket yang cocok dengan pencarian.
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAssignModalOpen(false);
                      setSelectedPaketIds([]);
                    }}
                    className="btn btn-secondary"
                    disabled={isAssigning}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isAssigning || selectedPaketIds.length === 0}
                  >
                    {isAssigning ? "Menambahkan..." : "Tambahkan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isRemoveModalOpen && paketToRemove && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md mx-auto">
            <div className="card-body">
              <h2 className="text-xl font-bold mb-2">Hapus Paket</h2>
              <p className="text-sm text-gray-600 mb-6">
                Paket{" "}
                <span className="font-semibold">{paketToRemove.name}</span> akan
                dihapus dari kelas ini. Tindakan ini tidak bisa dibatalkan.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!removingPaketId) {
                      setIsRemoveModalOpen(false);
                      setPaketToRemove(null);
                    }
                  }}
                  className="btn btn-secondary"
                  disabled={!!removingPaketId}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmRemovePaket}
                  className="btn btn-danger"
                  disabled={!!removingPaketId}
                >
                  {removingPaketId ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
