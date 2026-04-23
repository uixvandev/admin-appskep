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
  const { package_code } = useParams<{ package_code: string }>();
  const [availableSoals, setAvailableSoals] = useState<api.Soal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSoals, setSelectedSoals] = useState<Set<string>>(new Set());
  const [assigningBulk, setAssigningBulk] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [kodeSoal, setKodeSoal] = useState("");
  const [kategoriSoalName, setKategoriSoalName] = useState<string>("");
  const [kategoriSoals, setKategoriSoals] = useState<api.KategoriSoal[]>([]);
  const [kategoriLoading, setKategoriLoading] = useState(false);
  const [kategoriError, setKategoriError] = useState<string | null>(null);
  const [kategoriFilterName, setKategoriFilterName] = useState<string>("");
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
    if (!package_code) {
      setError("ID Paket tidak valid.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Fetch all soals and soals already in the paket
      const [allSoalsResponse, soalsInPaketResponse] = await Promise.all([
        api.getAllSoals(1, 100),
        api.getSoalsByPaket(package_code),
      ]);

      if (allSoalsResponse.success && allSoalsResponse.data) {
        const allSoals: api.Soal[] = allSoalsResponse.data.data;
        const soalsInPaket: api.Soal[] =
          soalsInPaketResponse.success && soalsInPaketResponse.data
            ? (soalsInPaketResponse.data as api.Soal[])
            : [];
        const soalsInPaketIds = new Set<string>(
          soalsInPaket.map((s: api.Soal) => s.question_code),
        );

        // Filter out soals that are already in the paket
        const filteredSoals = allSoals.filter(
          (s: api.Soal) => !soalsInPaketIds.has(s.question_code),
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
  }, [package_code]);

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

  const filteredSoals = useMemo(() => {
    let list = availableSoals;
    if (kategoriFilterName) {
      list = list.filter((soal) => {
        const kategoriName =
          soal.category_name ||
          soal.kategori_soal?.category_name ||
          soal.kategori_soal?.name ||
          "";
        return kategoriName === kategoriFilterName;
      });
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;

    return list.filter((soal) => {
      const kategoriName =
        soal.category_name ||
        soal.kategori_soal?.category_name ||
        soal.kategori_soal?.name ||
        "";
      return [
        soal.question,
        soal.question_code || soal.kode_soal || "",
        soal.question_code,
        kategoriName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [availableSoals, kategoriFilterName, searchQuery]);

  const hasFilter = kategoriFilterName !== "" || searchQuery.trim() !== "";
  const visibleSoalIds = useMemo(
    () => filteredSoals.map((soal) => soal.question_code),
    [filteredSoals],
  );
  const allVisibleSelected = useMemo(() => {
    if (visibleSoalIds.length === 0) return false;
    return visibleSoalIds.every((id) => selectedSoals.has(id));
  }, [visibleSoalIds, selectedSoals]);

  const toggleSelectSoal = (questionCode: string) => {
    setSelectedSoals((prev) => {
      const next = new Set(prev);
      if (next.has(questionCode)) {
        next.delete(questionCode);
      } else {
        next.add(questionCode);
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
    if (!package_code || selectedSoals.size === 0) return;
    setAssigningBulk(true);
    const selectedIds = Array.from(selectedSoals);

    const results = await Promise.allSettled(
      selectedIds.map((questionCode) =>
        api.assignSoalToPaket({
          package_code,
          question_code: questionCode,
        }),
      ),
    );

    const succeeded: string[] = [];
    const failed: string[] = [];

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
        prevSoals.filter((s) => !succeeded.includes(s.question_code)),
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
    setKategoriSoalName("");
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
    if (!kodeSoal.trim() || !kategoriSoalName.trim()) {
      setCreateError("Kode soal dan kategori wajib diisi.");
      return;
    }
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
        question_code: kodeSoal.trim(),
        category_name: kategoriSoalName,
        question,
        explanation,
        pilihan_jawaban: options,
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
            <Link to={`/paket/${package_code}`} className="btn btn-secondary">
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
                    value={kategoriFilterName}
                    onChange={(e) => setKategoriFilterName(e.target.value)}
                    disabled={kategoriLoading}
                  >
                    <option value="">Semua kategori</option>
                    {kategoriSoals.map((kategori) => {
                      const value =
                        kategori.category_name || kategori.name || "";
                      return (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      );
                    })}
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
                  key={soal.question_code}
                  className={`border p-4 rounded-lg flex justify-between items-center cursor-pointer transition-colors ${
                    selectedSoals.has(soal.question_code)
                      ? "bg-blue-50/40 border-blue-200"
                      : "bg-white hover:bg-gray-50"
                  }`}
                  onClick={() => toggleSelectSoal(soal.question_code)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleSelectSoal(soal.question_code);
                    }
                  }}
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {soal.question}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Kode: {soal.question_code || soal.kode_soal || "-"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Kategori:{" "}
                      {soal.category_name ||
                        soal.kategori_soal?.category_name ||
                        soal.kategori_soal?.name ||
                        "-"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedSoals.has(soal.question_code)}
                    onChange={() => toggleSelectSoal(soal.question_code)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Pilih soal ${soal.question_code}`}
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
                      Kode Soal
                    </label>
                    <input
                      id="kode-soal"
                      type="text"
                      className="form-input w-full"
                      placeholder="Contoh: SOAL-001"
                      value={kodeSoal}
                      onChange={(e) => setKodeSoal(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label htmlFor="kategori-soal" className="form-label">
                      Kategori Soal
                    </label>
                    <select
                      id="kategori-soal"
                      className="form-input w-full"
                      value={kategoriSoalName}
                      onChange={(e) => setKategoriSoalName(e.target.value)}
                      disabled={kategoriLoading}
                      required
                    >
                      <option value="">Pilih kategori...</option>
                      {kategoriSoals.map((kategori) => {
                        const value =
                          kategori.category_name || kategori.name || "";
                        return (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        );
                      })}
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
