import { useEffect, useState, useCallback } from "react";
import * as api from "../lib/api";
import type { Soal } from "../lib/api";
import PageHeader from "../components/PageHeader";

export default function QuestionsPage() {
  const [soals, setSoals] = useState<Soal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSoal, setEditingSoal] = useState<Soal | null>(null);
  const itemsPerPage = 10;
  const [viewingSoal, setViewingSoal] = useState<Soal | null>(null);
  const [deletingSoalId, setDeletingSoalId] = useState<number | null>(null);

  // Form states
  const [question, setQuestion] = useState("");
  const [explanation, setExplanation] = useState("");
  const [options, setOptions] = useState([
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const loadSoals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getAllSoals(currentPage, itemsPerPage);
      if (response && response.data) {
        setSoals(response.data.data);
        setCurrentPage(response.data.page);
        setTotalPages(response.data.total_pages);
        setTotal(response.data.total_items);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    if (!api.getToken()) {
      window.location.href = "/";
    } else {
      loadSoals();
    }
  }, [currentPage, loadSoals]);

  const handleDeleteSoal = async (soalId: number) => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menghapus soal ini? Tindakan ini tidak dapat dibatalkan."
      )
    ) {
      try {
        setDeletingSoalId(soalId);
        console.log("Deleting soal with ID:", soalId);

        // Direct API call untuk deleteSoal - endpoint: DELETE /api/v1/soals/{{soal_id}}
        const token = api.getToken();
        if (!token) {
          throw new Error("No authentication token");
        }

        const url = `/api/v1/soals/${soalId}`;
        console.log("Delete API URL:", url);

        const res = await fetch(url, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const contentType = res.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");
        const data =
          isJson && res.headers.get("content-length") !== "0"
            ? await res.json()
            : {
                success: res.ok,
                message: res.ok ? "Soal berhasil dihapus" : await res.text(),
              };

        console.log("Delete API Response:", data);

        if (!res.ok) {
          throw new Error(data.message || `HTTP error! status: ${res.status}`);
        }

        // Refresh data setelah delete berhasil
        await loadSoals();
        alert("Soal berhasil dihapus!");
        console.log("Soal deleted successfully");
      } catch (err) {
        console.error("Error deleting soal:", err);
        setError((err as Error).message);
        alert("Error menghapus soal: " + (err as Error).message);
      } finally {
        setDeletingSoalId(null);
      }
    }
  };

  const handleOptionChange = (
    index: number,
    field: "option_text" | "is_correct",
    value: string | boolean
  ) => {
    setOptions((prev) =>
      prev.map((option, i) =>
        i === index ? { ...option, [field]: value } : option
      )
    );
  };

  const resetForm = () => {
    setQuestion("");
    setExplanation("");
    setOptions([
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
    ]);
    setShowAddForm(false);
    setEditingSoal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!question || !explanation || options.some((opt) => !opt.option_text)) {
      setError("Semua field harus diisi.");
      setSubmitting(false);
      return;
    }

    if (!options.some((opt) => opt.is_correct)) {
      setError("Pilih satu jawaban yang benar.");
      setSubmitting(false);
      return;
    }

    try {
      if (editingSoal) {
        // TODO: Implement updateSoal API function when provided
        alert("Fitur edit akan segera tersedia!");
      } else {
        await api.createSoal({
          question,
          explanation,
          pilihan_jawaban: options,
        });
        alert("Soal berhasil dibuat!");
        resetForm();
        loadSoals();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSoal = (soal: Soal) => {
    setEditingSoal(soal);
    setQuestion(soal.question);
    setExplanation(soal.explanation || "");
    setOptions(soal.pilihan_jawaban);
    setShowAddForm(true);
  };

  const handleViewSoal = async (soalId: number) => {
    try {
      setLoading(true);
      console.log("Fetching soal detail for ID:", soalId);

      // Direct API call untuk getSoalById - endpoint: GET /api/v1/soals/{{soal_id}}
      const token = api.getToken();
      if (!token) {
        throw new Error("No authentication token");
      }

      const url = `/api/v1/soals/${soalId}`;
      console.log("API URL:", url);

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const data = isJson
        ? await res.json()
        : { success: false, message: await res.text() };

      console.log("API Response:", data);

      if (!res.ok) {
        throw new Error(data.message || `HTTP error! status: ${res.status}`);
      }

      if (data && data.data) {
        setViewingSoal(data.data);
        console.log("Soal detail loaded successfully");
      } else {
        throw new Error("Data soal tidak ditemukan");
      }
    } catch (err) {
      console.error("Error fetching soal detail:", err);
      setError((err as Error).message);
      alert("Error loading soal detail: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSoals = soals.filter((soal) =>
    soal.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCorrectAnswerText = (
    pilihan_jawaban: Array<{ option_text: string; is_correct: boolean }>
  ) => {
    const correctOption = pilihan_jawaban.find((opt) => opt.is_correct);
    return correctOption ? correctOption.option_text : "Tidak ada";
  };

  // Build compact page list with ellipsis similar to UsersPage/PaketUjianPage
  function getPageNumbers(total: number, current: number, max = 5): (number | string)[] {
    if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | string)[] = [];
    const side = Math.floor(max / 2);
    let start = Math.max(1, current - side);
    let end = Math.min(total, current + side);

    if (start === 1) {
      end = Math.min(total, max);
    } else if (end === total) {
      start = Math.max(1, total - max + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let p = start; p <= end; p++) pages.push(p);

    if (end < total) {
      if (end < total - 1) pages.push("...");
      pages.push(total);
    }
    return pages;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Memuat soal...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <PageHeader
        title="Manajemen Soal Ujian"
        description="Kelola bank soal ujian, buat soal baru, dan edit soal yang sudah ada."
        actions={
          <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Tambah Soal</span>
          </button>
        }
      />

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>
      )}

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Cari Soal</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Cari berdasarkan pertanyaan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="modal-overlay overlay-enter" role="dialog" aria-modal="true">
          <div className="modal modal-enter max-w-2xl w-full">
            <div className="modal-header">
              <h2 className="modal-title">{editingSoal ? "Edit Soal" : "Tambah Soal Baru"}</h2>
              <button onClick={resetForm} className="modal-close" aria-label="Tutup">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="form-control">
                  <label htmlFor="question" className="form-label">Pertanyaan</label>
                  <textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} className="form-input w-full" rows={4} required />
                  <p className="helper-text">Tulis pertanyaan sejelas mungkin.</p>
                </div>

                <div className="form-control">
                  <label htmlFor="explanation" className="form-label">Penjelasan (opsional)</label>
                  <textarea id="explanation" value={explanation} onChange={(e) => setExplanation(e.target.value)} className="form-input w-full" rows={3} placeholder="Penjelasan untuk soal ini..." />
                </div>

                <div className="form-control">
                  <label className="form-label">Pilihan Jawaban</label>
                  {options.map((option, index) => (
                    <div key={index} className="mb-3 p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-gray-600 font-medium">Opsi {String.fromCharCode(65 + index)}</label>
                        <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={option.is_correct}
                            onChange={(e) => handleOptionChange(index, "is_correct", e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          Jawaban Benar
                        </label>
                      </div>
                      <input
                        type="text"
                        value={option.option_text}
                        onChange={(e) => handleOptionChange(index, "option_text", e.target.value)}
                        className="form-input w-full"
                        placeholder={`Masukkan opsi ${String.fromCharCode(65 + index)}`}
                        required
                      />
                    </div>
                  ))}
                </div>
                <div className="modal-footer flex items-center justify-end gap-3">
                  <button type="button" onClick={resetForm} className="btn btn-secondary">Batal</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? "Menyimpan..." : editingSoal ? "Update Soal" : "Simpan Soal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Soal Modal */}
      {viewingSoal && (
        <div className="modal-overlay overlay-enter" role="dialog" aria-modal="true">
          <div className="modal modal-enter max-w-3xl w-full">
            <div className="modal-header">
              <h2 className="modal-title">Detail Soal #{viewingSoal.id}</h2>
              <button onClick={() => setViewingSoal(null)} className="modal-close" aria-label="Tutup">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body space-y-6">
              {/* Pertanyaan */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Pertanyaan:</label>
                <div className="p-4 bg-gray-100 rounded-lg text-gray-900">{viewingSoal.question}</div>
              </div>

              {/* Pilihan Jawaban */}
              <div>
                <label className="block text-gray-700 font-semibold mb-4">Pilihan Jawaban:</label>
                <div className="space-y-3">
                  {viewingSoal.pilihan_jawaban.map((option, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${option.is_correct ? "border-primary bg-primary/10" : "border-gray-200 bg-white"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${option.is_correct ? "bg-primary text-white" : "bg-gray-200 text-gray-700"}`}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="text-gray-900">{option.option_text}</span>
                        </div>
                        {option.is_correct && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">Jawaban Benar</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Penjelasan */}
              {viewingSoal.explanation && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Penjelasan:</label>
                  <div className="p-4 bg-blue-50 rounded-lg text-gray-900">{viewingSoal.explanation}</div>
                </div>
              )}

              {/* Actions */}
              <div className="modal-footer flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setViewingSoal(null);
                    handleEditSoal(viewingSoal);
                  }}
                  className="btn btn-primary"
                >
                  Edit Soal
                </button>
                <button onClick={() => setViewingSoal(null)} className="btn btn-secondary">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Soals Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Daftar Soal ({total} total)</h3>
        </div>

        {filteredSoals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada soal</h3>
            <p className="text-gray-600 mb-4">Mulai dengan membuat soal pertama Anda.</p>
            <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
              Tambah Soal Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto p-4">
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No.</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pertanyaan</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jawaban Benar</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredSoals.map((soal, index) => (
                    <tr key={soal.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-700">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-md truncate" title={soal.question}>
                          {soal.question}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="max-w-sm truncate" title={getCorrectAnswerText(soal.pilihan_jawaban)}>
                          {getCorrectAnswerText(soal.pilihan_jawaban)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleViewSoal(soal.id)} className="btn btn-secondary btn-sm">
                            Detail
                          </button>
                          <button onClick={() => handleEditSoal(soal)} className="btn btn-secondary btn-sm">
                            Ubah
                          </button>
                          <button
                            onClick={() => handleDeleteSoal(soal.id)}
                            className="btn btn-danger btn-sm flex items-center"
                            disabled={deletingSoalId === soal.id}
                          >
                            {deletingSoalId === soal.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                <span>Menghapus...</span>
                              </>
                            ) : (
                              "Hapus"
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 0 && totalPages > 1 && (
        <div className="bg-gray-50 px-6 sm:px-8 py-4 sm:py-6 border-t border-gray-100 mt-6 rounded-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600">
              Halaman
              <span className="ml-1 font-semibold text-gray-900">{currentPage}</span>
              <span className="ml-1">dari</span>
              <span className="ml-1 font-semibold text-gray-900">{totalPages}</span>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="h-10 px-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Halaman pertama"
              >
                «
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-10 px-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>
              <div className="flex items-center gap-1">
                {getPageNumbers(totalPages, currentPage, 5).map((p, idx) =>
                  typeof p === "number" ? (
                    <button
                      key={`page-${p}`}
                      onClick={() => setCurrentPage(p)}
                      className={`h-10 w-10 rounded-xl text-sm font-semibold transition-all ${
                        currentPage === p
                          ? "bg-primary-600 text-white shadow-sm"
                          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                      aria-current={currentPage === p ? "page" : undefined}
                    >
                      {p}
                    </button>
                  ) : (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">…</span>
                  )
                )}
              </div>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-10 px-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <span className="hidden sm:inline">Berikutnya</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-10 px-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Halaman terakhir"
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
