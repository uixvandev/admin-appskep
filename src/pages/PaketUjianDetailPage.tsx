import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import * as api from "../lib/api";
import PageHeader from "../components/PageHeader.tsx";
import Section from "../components/Section.tsx";

export default function PaketUjianDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [paket, setPaket] = useState<api.Paket | null>(null);
  const [soals, setSoals] = useState<api.Soal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedSoals, setSelectedSoals] = useState<Set<number>>(new Set());
  const [removing, setRemoving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  useEffect(() => {
    const fetchPaketDetail = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Fetch paket details
        const paketResponse = await api.getPaketById(parseInt(id));
        if (paketResponse.success && paketResponse.data) {
          setPaket(paketResponse.data);
        }

        // Fetch soals for this paket
        const soalsResponse = await api.getSoalsByPaket(parseInt(id));
        if (soalsResponse.success && soalsResponse.data) {
          setSoals(soalsResponse.data);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaketDetail();
  }, [id]);

  const toggleSelectionMode = () => {
    setSelectionMode((prev) => {
      const next = !prev;
      if (!next) {
        setSelectedSoals(new Set());
      }
      return next;
    });
  };

  const toggleSelectSoal = (soalId: number) => {
    setSelectedSoals((prev) => {
      const next = new Set(prev);
      if (next.has(soalId)) {
        next.delete(soalId);
      } else {
        next.add(soalId);
      }
      return next;
    });
  };

  const openRemoveModal = () => {
    if (selectedSoals.size === 0) return;
    setIsRemoveModalOpen(true);
  };

  const confirmRemoveSelected = async () => {
    if (!id || selectedSoals.size === 0) return;
    setRemoving(true);
    const paketId = parseInt(id);
    const removedIds: number[] = [];
    const failedIds: number[] = [];

    for (const soalId of selectedSoals) {
      try {
        const response = await api.removeSoalFromPaket({
          paket_id: paketId,
          soal_id: soalId,
        });
        if (response?.success === false) {
          failedIds.push(soalId);
        } else {
          removedIds.push(soalId);
        }
      } catch {
        failedIds.push(soalId);
      }
    }

    if (removedIds.length > 0) {
      setSoals((prev) => prev.filter((soal) => !removedIds.includes(soal.id)));
      setPaket((prev) =>
        prev
          ? {
              ...prev,
              total_questions: Math.max(
                0,
                prev.total_questions - removedIds.length,
              ),
            }
          : prev,
      );
    }

    if (failedIds.length > 0) {
      alert("Sebagian soal gagal dihapus. Coba lagi.");
      setSelectedSoals(new Set(failedIds));
    } else {
      setSelectedSoals(new Set());
      setSelectionMode(false);
    }

    setRemoving(false);
    setIsRemoveModalOpen(false);
  };

  const filteredSoals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return soals;

    return soals.filter((soal) => {
      const optionText = soal.pilihan_jawaban
        .map((option) => option.option_text)
        .join(" ");
      return [
        soal.question,
        soal.explanation || "",
        soal.kode_soal || "",
        optionText,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [searchQuery, soals]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!paket) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <p>Paket tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title={paket.name}
        description={paket.description}
        actions={
          <div className="flex items-center gap-3">
            {selectionMode ? (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={toggleSelectionMode}
                  disabled={removing}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={openRemoveModal}
                  disabled={removing || selectedSoals.size === 0}
                >
                  {removing ? "Menghapus..." : `Hapus (${selectedSoals.size})`}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={toggleSelectionMode}
              >
                Pilih Soal
              </button>
            )}
            <Link
              to={`/paket/${id}/tambah-soal`}
              className="btn btn-primary text-white hover:text-white focus-visible:text-white"
            >
              Tambah Soal
            </Link>
          </div>
        }
      />
      <Section>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Kode: {paket.kode_paket || "-"}</span>
              <span>Durasi: {paket.duration} menit</span>
              <span>Total Soal: {paket.total_questions}</span>
            </div>

            <div className="mt-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Daftar Soal ({filteredSoals.length}/{soals.length})
                  </h2>
                  <p className="text-sm text-gray-500">
                    Cari soal berdasarkan pertanyaan, kode, atau jawaban.
                  </p>
                </div>
                <div className="form-control sm:max-w-sm">
                  <label htmlFor="soal-search" className="form-label">
                    Pencarian Soal
                  </label>
                  <input
                    id="soal-search"
                    type="text"
                    className="form-input w-full bg-white border-gray-300 shadow-sm"
                    placeholder="Cari soal di paket ini..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {soals.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg text-gray-500">
                  <p className="font-semibold">
                    Belum ada soal dalam paket ini.
                  </p>
                  <p className="text-sm mt-2">
                    Klik "Tambah Soal" untuk menambahkan soal pertama.
                  </p>
                </div>
              ) : filteredSoals.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg text-gray-500">
                  <p className="font-semibold">
                    Tidak ada soal yang cocok dengan pencarian.
                  </p>
                  <p className="text-sm mt-2">
                    Coba kata kunci lain atau kosongkan pencarian.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSoals.map((soal, index) => (
                    <div
                      key={soal.id}
                      className={`border border-gray-200 rounded-lg p-4 transition-colors ${
                        selectionMode && selectedSoals.has(soal.id)
                          ? "bg-blue-50/40 border-blue-200"
                          : "bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start gap-3">
                          {selectionMode && (
                            <input
                              type="checkbox"
                              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={selectedSoals.has(soal.id)}
                              onChange={() => toggleSelectSoal(soal.id)}
                              aria-label={`Pilih soal ${index + 1}`}
                            />
                          )}
                          <h3 className="font-medium text-gray-900 leading-relaxed">
                            {index + 1}. {soal.question}
                          </h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                        {(soal.pilihan_jawaban ?? []).map(
                          (pilihan, pilihanIndex) => (
                            <div
                              key={pilihan.id}
                              className={`p-3 rounded-md text-sm border ${
                                pilihan.is_correct
                                  ? "bg-green-50 border-green-200 text-green-800 font-medium"
                                  : "bg-gray-50 border-gray-200 text-gray-700"
                              }`}
                            >
                              <span className="font-bold">
                                {String.fromCharCode(65 + pilihanIndex)}.
                              </span>{" "}
                              {pilihan.option_text}
                              {pilihan.is_correct && (
                                <span className="ml-2 text-xs font-semibold">
                                  (Jawaban Benar)
                                </span>
                              )}
                            </div>
                          ),
                        )}
                      </div>

                      {soal.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md text-sm border border-blue-200">
                          <strong className="text-blue-800">Penjelasan:</strong>
                          <p className="text-blue-700 mt-1">
                            {soal.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>

      {isRemoveModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md mx-auto">
            <div className="card-body">
              <h2 className="text-xl font-bold mb-2">Hapus Soal</h2>
              <p className="text-sm text-gray-600 mb-6">
                {selectedSoals.size} soal akan dihapus dari paket ini. Tindakan
                ini tidak bisa dibatalkan.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!removing) setIsRemoveModalOpen(false);
                  }}
                  className="btn btn-secondary"
                  disabled={removing}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmRemoveSelected}
                  className="btn btn-danger"
                  disabled={removing}
                >
                  {removing ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
