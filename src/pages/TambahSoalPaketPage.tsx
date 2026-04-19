import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  type FormEvent,
} from "react";
import { Trash2 } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import * as api from "../lib/api";
import PageHeader from "../components/PageHeader.tsx";

export default function TambahSoalPaketPage() {
  const { id: paketId } = useParams<{ id: string }>();
  const [availableSoals, setAvailableSoals] = useState<api.Soal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSoals, setSelectedSoals] = useState<Set<number>>(new Set());
  const [assigningBulk, setAssigningBulk] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [kodeSoal, setKodeSoal] = useState("");
  const [kategoriSoalId, setKategoriSoalId] = useState<number | "">("");
  const [kategoriSoals, setKategoriSoals] = useState<api.KategoriSoal[]>([]);
  const [kategoriLoading, setKategoriLoading] = useState(false);
  const [kategoriError, setKategoriError] = useState<string | null>(null);
  const [kategoriFilterId, setKategoriFilterId] = useState<number | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [question, setQuestion] = useState("");
  const [explanation, setExplanation] = useState("");
  const [options, setOptions] = useState([
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
  ]);

  const fetchSoals = useCallback(async () => {
    if (!paketId) {
      setError("ID Paket tidak valid.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Fetch all soals and soals already in the paket
      const [allSoalsResponse, soalsInPaketResponse] = await Promise.all([
        api.getAllSoals(1, 100),
        api.getSoalsByPaket(parseInt(paketId)),
      ]);

      if (allSoalsResponse.success && allSoalsResponse.data) {
        const allSoals: api.Soal[] = allSoalsResponse.data.data;
        const soalsInPaket: api.Soal[] =
          soalsInPaketResponse.success && soalsInPaketResponse.data
            ? (soalsInPaketResponse.data as api.Soal[])
            : [];
        const soalsInPaketIds = new Set<number>(
          soalsInPaket.map((s: api.Soal) => s.id),
        );

        // Filter out soals that are already in the paket
        const filteredSoals = allSoals.filter(
          (s: api.Soal) => !soalsInPaketIds.has(s.id),
        );
        setAvailableSoals(filteredSoals);
      } else {
        setError(allSoalsResponse.message || "Gagal memuat daftar soal.");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan jaringan.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [paketId]);

  useEffect(() => {
    fetchSoals();
  }, [fetchSoals]);

  useEffect(() => {
    const loadKategori = async () => {
      setKategoriLoading(true);
      setKategoriError(null);
      try {
        const response = await api.getKategoriSoals(1, 100);
        if (response?.success) {
          const list = Array.isArray(response?.data?.data)
            ? response.data.data
            : Array.isArray(response?.data)
              ? response.data
              : [];
          setKategoriSoals(list);
        } else {
          setKategoriError(response?.message || "Gagal memuat kategori soal");
        }
      } catch (err) {
        setKategoriError((err as Error).message);
      } finally {
        setKategoriLoading(false);
      }
    };

    loadKategori();
  }, []);

  const kategoriNameById = useMemo(() => {
    const map = new Map<number, string>();
    kategoriSoals.forEach((kategori) => {
      map.set(kategori.id, kategori.name);
    });
    return map;
  }, [kategoriSoals]);

  const filteredSoals = useMemo(() => {
    let list = availableSoals;
    if (kategoriFilterId !== "") {
      list = list.filter((soal) => {
        const kategoriId = soal.kategori_soal_id ?? soal.kategori_soal?.id;
        return kategoriId === kategoriFilterId;
      });
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;

    return list.filter((soal) => {
      const kategoriId = soal.kategori_soal_id ?? soal.kategori_soal?.id;
      const kategoriName = kategoriNameById.get(kategoriId ?? -1) || "";
      return [
        soal.question,
        soal.kode_soal ?? "",
        String(soal.id),
        kategoriName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [availableSoals, kategoriFilterId, kategoriNameById, searchQuery]);

  const hasFilter = kategoriFilterId !== "" || searchQuery.trim() !== "";
  const visibleSoalIds = useMemo(
    () => filteredSoals.map((soal) => soal.id),
    [filteredSoals],
  );
  const allVisibleSelected = useMemo(() => {
    if (visibleSoalIds.length === 0) return false;
    return visibleSoalIds.every((id) => selectedSoals.has(id));
  }, [visibleSoalIds, selectedSoals]);

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

  const clearSelection = () => {
    setSelectedSoals(new Set());
  };

  const toggleSelectAllVisible = () => {
    setSelectedSoals((prev) => {
      const next = new Set(prev);
      const allSelected =
        visibleSoalIds.length > 0 && visibleSoalIds.every((id) => next.has(id));
      if (allSelected) {
        visibleSoalIds.forEach((id) => next.delete(id));
      } else {
        visibleSoalIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleAssignSelected = async () => {
    if (!paketId || selectedSoals.size === 0) return;
    setAssigningBulk(true);
    const paketIdNum = parseInt(paketId);
    const selectedIds = Array.from(selectedSoals);

    const results = await Promise.allSettled(
      selectedIds.map((soalId) =>
        api.assignSoalToPaket({ paket_id: paketIdNum, soal_id: soalId }),
      ),
    );

    const succeeded: number[] = [];
    const failed: number[] = [];

    results.forEach((result, index) => {
      const soalId = selectedIds[index];
      if (
        result.status === "fulfilled" &&
        result.value &&
        result.value.success !== false
      ) {
        succeeded.push(soalId);
      } else {
        failed.push(soalId);
      }
    });

    if (succeeded.length > 0) {
      setAvailableSoals((prevSoals) =>
        prevSoals.filter((s) => !succeeded.includes(s.id)),
      );
    }

    if (failed.length > 0) {
      alert("Sebagian soal gagal ditambahkan. Coba lagi.");
      setSelectedSoals(new Set(failed));
    } else {
      alert("Soal berhasil ditambahkan ke paket.");
      clearSelection();
    }

    setAssigningBulk(false);
  };

  // Modal helpers for creating a new soal
  const resetCreateForm = () => {
    setKodeSoal("");
    setKategoriSoalId("");
    setQuestion("");
    setExplanation("");
    setOptions([
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
    ]);
    setCreateError(null);
    setSubmitting(false);
  };

  const handleOptionChange = (
    index: number,
    field: "option_text" | "is_correct",
    value: string | boolean,
  ) => {
    setOptions((prev) =>
      prev.map((option, i) => {
        if (field === "is_correct") {
          return { ...option, is_correct: i === index };
        }
        if (i === index) {
          return {
            ...option,
            option_text: typeof value === "string" ? value : option.option_text,
          };
        }
        return option;
      }),
    );
  };

  const addOption = () => {
    setOptions((prev) => [...prev, { option_text: "", is_correct: false }]);
  };

  const removeOption = (index: number) => {
    setOptions((prev) => {
      if (prev.length <= 2) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleCreateSoal = async (e: FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (!question || options.some((opt) => !opt.option_text)) {
      setCreateError("Pertanyaan dan semua opsi harus diisi.");
      return;
    }
    if (!options.some((opt) => opt.is_correct)) {
      setCreateError("Pilih satu jawaban yang benar.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.createSoal({
        question,
        explanation,
        pilihan_jawaban: options,
        ...(kodeSoal.trim() ? { kode_soal: kodeSoal.trim() } : {}),
        ...(kategoriSoalId !== ""
          ? { kategori_soal_id: Number(kategoriSoalId) }
          : {}),
      });
      if (!res.success) {
        throw new Error(res.message || "Gagal membuat soal");
      }
      await fetchSoals();
      setShowCreateModal(false);
      resetCreateForm();
    } catch (err) {
      setCreateError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Memuat daftar soal...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <>
      <PageHeader
        title="Tambah Soal ke Paket"
        description="Pilih soal dari bank soal untuk ditambahkan ke dalam paket ujian ini."
        actions={
          <div className="flex gap-3">
            <Link to={`/paket/${paketId}`} className="btn btn-secondary">
              &larr; Kembali ke Detail Paket
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              Buat Soal Baru
            </button>
          </div>
        }
      />
      <div className="card">
        <div className="card-body">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="form-control sm:max-w-xs">
                  <label htmlFor="kategori-filter" className="form-label">
                    Filter Kategori Soal
                  </label>
                  <select
                    id="kategori-filter"
                    className="form-input w-full"
                    value={
                      kategoriFilterId === "" ? "" : String(kategoriFilterId)
                    }
                    onChange={(e) =>
                      setKategoriFilterId(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    disabled={kategoriLoading}
                  >
                    <option value="">Semua kategori</option>
                    {kategoriSoals.map((kategori) => (
                      <option key={kategori.id} value={kategori.id}>
                        {kategori.name}
                      </option>
                    ))}
                  </select>
                  {kategoriError && (
                    <p className="helper-text text-red-600">{kategoriError}</p>
                  )}
                </div>
                <div className="form-control sm:max-w-xs">
                  <label htmlFor="soal-search" className="form-label">
                    Pencarian Soal
                  </label>
                  <input
                    id="soal-search"
                    type="text"
                    className="form-input w-full bg-white border-gray-300 shadow-sm"
                    placeholder="Cari pertanyaan, kode, atau kategori"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <div className="text-sm text-gray-500">
                  Menampilkan {filteredSoals.length} soal
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={toggleSelectAllVisible}
                    disabled={assigningBulk || filteredSoals.length === 0}
                  >
                    {allVisibleSelected ? "Batalkan Semua" : "Pilih Semua"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleAssignSelected}
                    disabled={assigningBulk || selectedSoals.size === 0}
                  >
                    {assigningBulk
                      ? "Menambahkan..."
                      : `Tambah Soal (${selectedSoals.size})`}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={clearSelection}
                    disabled={assigningBulk || selectedSoals.size === 0}
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>

            {filteredSoals.length > 0 ? (
              filteredSoals.map((soal) => (
                <div
                  key={soal.id}
                  className={`border p-4 rounded-lg flex justify-between items-center cursor-pointer transition-colors ${
                    selectedSoals.has(soal.id)
                      ? "bg-blue-50/40 border-blue-200"
                      : "bg-white hover:bg-gray-50"
                  }`}
                  onClick={() => toggleSelectSoal(soal.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleSelectSoal(soal.id);
                    }
                  }}
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {soal.question}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      ID Soal: {soal.id} | Kode: {soal.kode_soal || "-"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Kategori:{" "}
                      {kategoriNameById.get(
                        soal.kategori_soal_id ?? soal.kategori_soal?.id ?? -1,
                      ) || "-"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedSoals.has(soal.id)}
                    onChange={() => toggleSelectSoal(soal.id)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Pilih soal ${soal.id}`}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="font-semibold text-gray-700">
                  {hasFilter
                    ? "Tidak ada soal yang cocok dengan filter ini."
                    : "Tidak ada soal baru yang tersedia."}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {hasFilter
                    ? "Coba hapus filter atau ubah kata kunci pencarian."
                    : "Semua soal sudah ada di dalam paket ini atau belum ada soal yang dibuat."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div
          className="modal-overlay overlay-enter"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal modal-enter max-w-2xl w-full">
            <div className="modal-header">
              <h2 className="modal-title">Buat Soal Baru</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
                className="modal-close"
                aria-label="Tutup"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              {createError && (
                <div className="alert alert-danger mb-4">
                  <div className="alert-content">
                    <div className="alert-title">Terjadi kesalahan</div>
                    <div className="alert-message">{createError}</div>
                  </div>
                </div>
              )}
              <form onSubmit={handleCreateSoal} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="form-control">
                    <label htmlFor="kode-soal" className="form-label">
                      Kode Soal (opsional)
                    </label>
                    <input
                      id="kode-soal"
                      type="text"
                      className="form-input w-full"
                      placeholder="Contoh: SOAL-001"
                      value={kodeSoal}
                      onChange={(e) => setKodeSoal(e.target.value)}
                    />
                    <p className="helper-text">
                      Kosongkan untuk otomatis dari sistem.
                    </p>
                  </div>
                  <div className="form-control">
                    <label htmlFor="kategori-soal" className="form-label">
                      Kategori Soal (opsional)
                    </label>
                    <select
                      id="kategori-soal"
                      className="form-input w-full"
                      value={
                        kategoriSoalId === "" ? "" : String(kategoriSoalId)
                      }
                      onChange={(e) =>
                        setKategoriSoalId(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      disabled={kategoriLoading}
                    >
                      <option value="">Pilih kategori...</option>
                      {kategoriSoals.map((kategori) => (
                        <option key={kategori.id} value={kategori.id}>
                          {kategori.name}
                        </option>
                      ))}
                    </select>
                    {kategoriError && (
                      <p className="helper-text text-red-600">
                        {kategoriError}
                      </p>
                    )}
                  </div>
                </div>
                <div className="form-control">
                  <label htmlFor="q" className="form-label">
                    Pertanyaan
                  </label>
                  <textarea
                    id="q"
                    className="form-input w-full"
                    rows={4}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                  />
                </div>
                <div className="form-control">
                  <label htmlFor="exp" className="form-label">
                    Penjelasan (opsional)
                  </label>
                  <textarea
                    id="exp"
                    className="form-input w-full"
                    rows={3}
                    placeholder="Penjelasan untuk soal ini..."
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="form-label">Pilihan Jawaban</label>
                  <div className="space-y-3">
                    {options.map((opt, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border p-3 bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-gray-600 font-medium">
                            Opsi {String.fromCharCode(65 + idx)}
                          </label>
                          <div className="flex items-center gap-3">
                            <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                              <input
                                type="radio"
                                name="correct-answer"
                                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={opt.is_correct}
                                onChange={() =>
                                  handleOptionChange(idx, "is_correct", true)
                                }
                              />
                              Jawaban Benar
                            </label>
                            <button
                              type="button"
                              onClick={() => removeOption(idx)}
                              disabled={options.length <= 2}
                              className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Hapus opsi"
                              title="Hapus opsi"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          className="form-input w-full"
                          placeholder={`Masukkan opsi ${String.fromCharCode(65 + idx)}`}
                          value={opt.option_text}
                          onChange={(e) =>
                            handleOptionChange(
                              idx,
                              "option_text",
                              e.target.value,
                            )
                          }
                          required
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addOption}
                      className="btn btn-ghost btn-sm"
                    >
                      Tambah Opsi
                    </button>
                  </div>
                </div>
                <div className="modal-footer flex items-center justify-end gap-3">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetCreateForm();
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "Menyimpan..." : "Simpan Soal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
