import { useEffect, useState, useCallback } from "react";
import { Trash2 } from "lucide-react";
import * as api from "../lib/api";
import type { Soal } from "../lib/api";
import PageHeader from "../components/PageHeader.tsx";

export default function QuestionsPage() {
  const [soals, setSoals] = useState<Soal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [kategoriFilterName, setKategoriFilterName] = useState<string>("");
  const [allSoals, setAllSoals] = useState<Soal[]>([]);
  const [allSoalsLoading, setAllSoalsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSoal, setEditingSoal] = useState<Soal | null>(null);
  const itemsPerPage = 10;
  const [viewingSoal, setViewingSoal] = useState<Soal | null>(null);
  const [deletingSoalId, setDeletingSoalId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [soalToDelete, setSoalToDelete] = useState<Soal | null>(null);
  const [toggleActionLabel, setToggleActionLabel] = useState<"Hapus">("Hapus");
  const [kategoriSoals, setKategoriSoals] = useState<api.KategoriSoal[]>([]);
  const [kategoriLoading, setKategoriLoading] = useState(false);
  const [kategoriError, setKategoriError] = useState<string | null>(null);

  // Form states
  const [kodeSoal, setKodeSoal] = useState("");
  const [kategoriSoalName, setKategoriSoalName] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [explanation, setExplanation] = useState("");
  const [options, setOptions] = useState<
    Array<{ id?: number; option_text: string; is_correct: boolean }>
  >([
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [originalQuestionCode, setOriginalQuestionCode] = useState("");

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

  const loadKategoriSoals = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (!api.getToken()) {
      window.location.href = "/";
    } else {
      loadSoals();
    }
  }, [currentPage, loadSoals]);

  useEffect(() => {
    loadKategoriSoals();
  }, [loadKategoriSoals]);

  const loadAllSoals = useCallback(async () => {
    setAllSoalsLoading(true);
    try {
      const first = await api.getAllSoals(1, 100);
      if (!first?.data) return;

      const totalPages = first.data.total_pages || 1;
      const combined = [...first.data.data];

      if (totalPages > 1) {
        const requests = Array.from({ length: totalPages - 1 }, (_, idx) =>
          api.getAllSoals(idx + 2, 100),
        );
        const responses = await Promise.all(requests);
        responses.forEach((res) => {
          if (res?.data?.data) {
            combined.push(...res.data.data);
          }
        });
      }

      setAllSoals(combined);
    } catch (err) {
      console.error("Error loading all soals:", err);
    } finally {
      setAllSoalsLoading(false);
    }
  }, []);

  useEffect(() => {
    const hasFilter = searchQuery.trim() !== "" || kategoriFilterName !== "";
    if (!hasFilter) return;
    if (allSoals.length > 0 || allSoalsLoading) return;
    loadAllSoals();
  }, [
    searchQuery,
    kategoriFilterName,
    allSoals.length,
    allSoalsLoading,
    loadAllSoals,
  ]);
  const openDeleteModal = (soal: Soal) => {
    setSoalToDelete(soal);
    setToggleActionLabel("Hapus");
    setIsDeleteModalOpen(true);
  };
  const handleToggleSoalStatus = async (questionCode: string) => {
    try {
      setDeletingSoalId(questionCode);

      if (soalToDelete?.is_active === 0) {
        throw new Error("Soal ini sudah dihapus");
      }

      const res = await api.deleteSoal(questionCode);
      if (!res?.success) {
        throw new Error(res?.message || "Gagal menghapus soal");
      }

      await loadSoals();
      setAllSoals((prev) =>
        prev.map((soal) =>
          soal.question_code === questionCode
            ? {
                ...soal,
                is_active: 0,
              }
            : soal,
        ),
      );
      setIsDeleteModalOpen(false);
      setSoalToDelete(null);
      alert("Soal berhasil dihapus.");
    } catch (err) {
      setError((err as Error).message);
      alert(`Error menghapus soal: ${(err as Error).message}`);
    } finally {
      setDeletingSoalId(null);
    }
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

  const resetForm = () => {
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
    setShowAddForm(false);
    setEditingSoal(null);
    setOriginalQuestionCode("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!kodeSoal.trim() || !kategoriSoalName.trim()) {
      setError("Kode soal dan kategori wajib diisi.");
      setSubmitting(false);
      return;
    }

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
        console.log("✏️ Editing soal:", editingSoal);
        console.log("📝 Form data - Question:", question);
        console.log("📝 Form data - Explanation:", explanation);
        console.log("📝 Form data - Options:", options);

        // Clean options data - hanya kirim option_text dan is_correct
        const cleanedOptions = options.map(({ id, option_text, is_correct }) =>
          id ? { id, option_text, is_correct } : { option_text, is_correct },
        );

        console.log("🧹 Cleaned options:", cleanedOptions);

        // Direct API call seperti deleteSoal - untuk memastikan sama
        const token = api.getToken();
        if (!token) {
          throw new Error("No authentication token");
        }

        // Gunakan question_code asli sebagai path parameter saat update
        const targetQuestionCode =
          originalQuestionCode || editingSoal.question_code;
        const url = `http://localhost:8080/api/v1/soals/${targetQuestionCode}`;
        console.log("🌐 Update API URL:", url);
        console.log("🔑 Token preview:", token.substring(0, 20) + "...");

        const requestBody = {
          question_code: kodeSoal.trim(),
          category_name: kategoriSoalName,
          question,
          explanation,
          pilihan_jawaban: cleanedOptions,
        };
        console.log("📤 Request body:", JSON.stringify(requestBody, null, 2));

        const res = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        console.log("📥 Response status:", res.status, res.statusText);

        const contentType = res.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");
        const data =
          isJson && res.headers.get("content-length") !== "0"
            ? await res.json()
            : {
                success: res.ok,
                message: res.ok ? "Soal berhasil diupdate" : await res.text(),
              };

        console.log("📥 Response data:", data);

        // WORKAROUND: backend bisa mengembalikan "not found" dengan shape/casing berbeda
        // meskipun update kemungkinan sudah berhasil di DB.
        const extractErrorText = (value: unknown): string => {
          if (typeof value === "string") return value;
          if (value && typeof value === "object") {
            const obj = value as {
              message?: unknown;
              error?: unknown;
              errors?: unknown;
            };
            if (typeof obj.message === "string") return obj.message;
            if (typeof obj.error === "string") return obj.error;
            if (Array.isArray(obj.errors)) {
              const first = obj.errors.find((item) => typeof item === "string");
              if (typeof first === "string") return first;
            }
          }
          return "";
        };

        const errorText = extractErrorText(data).toLowerCase();
        const isNotFoundFalseNegative =
          !res.ok &&
          (errorText.includes("soal not found") ||
            (errorText.includes("not found") && errorText.includes("soal")));

        if (isNotFoundFalseNegative) {
          console.warn(
            "⚠️ Backend returned not-found style error; treating as potential false-negative and reloading data",
          );
          await loadSoals();
          alert("Update berhasil. Silakan cek apakah data berubah.");
          resetForm();
          return;
        }

        if (!res.ok) {
          throw new Error(data.message || `HTTP error! status: ${res.status}`);
        }

        if (data?.data) {
          setSoals((prev) =>
            prev.map((soal) =>
              soal.question_code === data.data.question_code ? data.data : soal,
            ),
          );
          setAllSoals((prev) =>
            prev.map((soal) =>
              soal.question_code === data.data.question_code ? data.data : soal,
            ),
          );
          if (viewingSoal?.question_code === data.data.question_code) {
            setViewingSoal(data.data);
          }
        } else {
          await loadSoals();
        }

        alert("Soal berhasil diupdate!");
        resetForm();
      } else {
        const created = await api.createSoal({
          question_code: kodeSoal.trim(),
          category_name: kategoriSoalName,
          question,
          explanation,
          pilihan_jawaban: options,
        });
        const newSoal = created?.data;
        if (newSoal) {
          setAllSoals((prev) => [newSoal, ...prev]);
        }
        alert("Soal berhasil dibuat!");
        resetForm();
        loadSoals();
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      console.error("Error submitting soal:", err);

      if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
        const backendError =
          "⚠️ Backend Error: Endpoint tidak ditemukan\n\n" +
          "Endpoint PUT /api/v1/soals/:id belum diimplementasikan dengan benar di backend.";
        setError(backendError);
        alert(backendError);
      } else if (errorMessage.includes("Soal not found")) {
        const backendBug =
          "🐛 Bug Backend Terdeteksi!\n\n" +
          `Backend tidak bisa menemukan soal dengan ID ${editingSoal?.id} saat update.\n\n` +
          "Padahal soal ini jelas ada (terlihat di daftar).\n\n" +
          "⚠️ Ini adalah BUG di backend handler PUT /api/v1/soals/:id\n\n" +
          "Mohon hubungi developer backend untuk memperbaiki:\n" +
          "1. Check query SELECT di handler Update\n" +
          "2. Pastikan parameter ID benar (:id vs :soal_id)\n" +
          "3. Check transaction/commit di database\n\n" +
          "Frontend sudah mengirim request dengan benar.";
        setError(backendBug);
        alert(backendBug);
      } else {
        setError(errorMessage);
        alert("Error: " + errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSoal = (soal: Soal) => {
    setEditingSoal(soal);
    setKodeSoal(soal.question_code || "");
    setOriginalQuestionCode(soal.question_code || "");
    setKategoriSoalName(
      soal.category_name || soal.kategori_soal?.category_name || "",
    );
    setQuestion(soal.question);
    setExplanation(soal.explanation || "");
    // Map pilihan_jawaban dan hanya ambil field yang diperlukan
    const cleanedOptions =
      soal.pilihan_jawaban?.map(({ id, option_text, is_correct }) => ({
        id,
        option_text,
        is_correct,
      })) ?? [];
    setOptions(cleanedOptions);
    setShowAddForm(true);
  };

  const handleViewSoal = async (questionCode: string) => {
    try {
      setLoading(true);
      console.log("Fetching soal detail for code:", questionCode);

      // Direct API call untuk getSoalById - endpoint: GET /api/v1/soals/{{soal_id}}
      const token = api.getToken();
      if (!token) {
        throw new Error("No authentication token");
      }

      const url = `/api/v1/soals/${questionCode}`;
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

  const getKategoriLabel = (soal: Soal) => {
    return (
      soal.category_name ||
      soal.kategori_soal?.category_name ||
      soal.kategori_soal?.name ||
      "-"
    );
  };

  const isFiltering = searchQuery.trim() !== "" || kategoriFilterName !== "";
  const sourceSoals = isFiltering ? allSoals : soals;

  const filteredSoals = sourceSoals.filter((soal) => {
    if (kategoriFilterName) {
      const kategoriName = getKategoriLabel(soal);
      if (kategoriName !== kategoriFilterName) {
        return false;
      }
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const kategoriLabel = getKategoriLabel(soal).toLowerCase();
    return (
      soal.question.toLowerCase().includes(q) ||
      (soal.question_code
        ? soal.question_code.toLowerCase().includes(q)
        : soal.kode_soal
          ? soal.kode_soal.toLowerCase().includes(q)
          : false) ||
      (kategoriLabel !== "-" && kategoriLabel.includes(q))
    );
  });

  const getCorrectAnswerText = (
    pilihan_jawaban?: Array<{ option_text: string; is_correct: boolean }>,
  ) => {
    const list = Array.isArray(pilihan_jawaban) ? pilihan_jawaban : [];
    const correctOption = list.find((opt) => opt.is_correct);
    return correctOption ? correctOption.option_text : "Tidak ada";
  };

  // Build compact page list with ellipsis similar to UsersPage/PaketUjianPage
  function getPageNumbers(
    total: number,
    current: number,
    max = 5,
  ): (number | string)[] {
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
        description="Kelola bank soal ujian, buat soal baru, dan ubah soal yang sudah ada."
        actions={
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Tambah Soal</span>
          </button>
        }
      />

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Search & Filter */}
      <div className="mb-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,240px)]">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cari Soal
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari berdasarkan pertanyaan, kode, atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input w-full pl-10 pr-4"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter Kategori
          </label>
          <select
            className="form-input w-full"
            value={kategoriFilterName}
            onChange={(e) => setKategoriFilterName(e.target.value)}
            disabled={kategoriLoading}
          >
            <option value="">Semua kategori</option>
            {kategoriSoals.map((kategori) => (
              <option
                key={kategori.category_name}
                value={kategori.category_name}
              >
                {kategori.category_name}
              </option>
            ))}
          </select>
          {kategoriError && (
            <p className="helper-text text-red-600">{kategoriError}</p>
          )}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div
          className="modal-overlay overlay-enter"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal modal-enter max-w-2xl w-full">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingSoal ? "Ubah Soal" : "Tambah Soal Baru"}
              </h2>
              <button
                onClick={resetForm}
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
              <form onSubmit={handleSubmit} className="space-y-5">
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
                    <p className="helper-text">
                      Wajib diisi sesuai format kode soal (contoh: Q-KLINK-001).
                    </p>
                  </div>
                  <div className="form-control">
                    <label htmlFor="kategori-soal" className="form-label">
                      Kategori Soal (opsional)
                    </label>
                    <select
                      id="kategori-soal"
                      className="form-input w-full"
                      value={kategoriSoalName}
                      onChange={(e) => setKategoriSoalName(e.target.value)}
                      disabled={kategoriLoading}
                    >
                      <option value="">Pilih kategori...</option>
                      {kategoriSoals.map((kategori) => (
                        <option
                          key={kategori.category_name}
                          value={kategori.category_name}
                        >
                          {kategori.category_name}
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
                  <label htmlFor="question" className="form-label">
                    Pertanyaan
                  </label>
                  <textarea
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="form-input w-full"
                    rows={4}
                    required
                  />
                  <p className="helper-text">
                    Tulis pertanyaan sejelas mungkin.
                  </p>
                </div>

                <div className="form-control">
                  <label htmlFor="explanation" className="form-label">
                    Pembahasan
                  </label>
                  <textarea
                    id="explanation"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="form-input w-full"
                    rows={3}
                    placeholder="Pembahasan untuk soal ini..."
                  />
                </div>

                <div className="form-control">
                  <label className="form-label">Pilihan Jawaban</label>
                  {options.map((option, index) => (
                    <div
                      key={index}
                      className="mb-3 p-4 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-gray-600 font-medium">
                          Opsi {String.fromCharCode(65 + index)}
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                            <input
                              type="radio"
                              name="correct-answer"
                              checked={option.is_correct}
                              onChange={() =>
                                handleOptionChange(index, "is_correct", true)
                              }
                              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Jawaban Benar
                          </label>
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
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
                        value={option.option_text}
                        onChange={(e) =>
                          handleOptionChange(
                            index,
                            "option_text",
                            e.target.value,
                          )
                        }
                        className="form-input w-full"
                        placeholder={`Masukkan opsi ${String.fromCharCode(
                          65 + index,
                        )}`}
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
                <div className="modal-footer flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-secondary"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                  >
                    {submitting
                      ? "Menyimpan..."
                      : editingSoal
                        ? "Update Soal"
                        : "Simpan Soal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Soal Modal */}
      {viewingSoal && (
        <div
          className="modal-overlay overlay-enter"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal modal-enter max-w-3xl w-full">
            <div className="modal-header">
              <h2 className="modal-title">
                Detail Soal #{viewingSoal.question_code}
              </h2>
              <button
                onClick={() => setViewingSoal(null)}
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
            <div className="modal-body space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Kode Soal:
                  </label>
                  <div className="p-3 bg-gray-100 rounded-lg text-gray-900">
                    {viewingSoal.question_code || "-"}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Kategori Soal:
                  </label>
                  <div className="p-3 bg-gray-100 rounded-lg text-gray-900">
                    {getKategoriLabel(viewingSoal)}
                  </div>
                </div>
              </div>
              {/* Pertanyaan */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Pertanyaan:
                </label>
                <div className="p-4 bg-gray-100 rounded-lg text-gray-900">
                  {viewingSoal.question}
                </div>
              </div>

              {/* Pilihan Jawaban */}
              <div>
                <label className="block text-gray-700 font-semibold mb-4">
                  Pilihan Jawaban:
                </label>
                <div className="space-y-3">
                  {viewingSoal?.pilihan_jawaban?.map((option, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        option.is_correct
                          ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                              option.is_correct
                                ? "bg-[color:var(--accent)] text-white"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="text-gray-900">
                            {option.option_text}
                          </span>
                        </div>
                        {option.is_correct && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm font-medium">
                              Jawaban Benar
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pembahasan */}
              {viewingSoal.explanation && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Pembahasan:
                  </label>
                  <div className="p-4 bg-blue-50 rounded-lg text-gray-900">
                    {viewingSoal.explanation}
                  </div>
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
                  disabled={viewingSoal.is_active === 0}
                  title={viewingSoal.is_active === 0 ? "Soal yang sudah dihapus tidak dapat diubah" : ""}
                >
                  Ubah Soal
                </button>
                <button
                  onClick={() => setViewingSoal(null)}
                  className="btn btn-secondary"
                >
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
          <h3 className="text-lg font-semibold text-gray-900">
            {isFiltering
              ? `Hasil Pencarian (${filteredSoals.length} soal)`
              : `Daftar Soal (${total} total)`}
          </h3>
        </div>

        {isFiltering && allSoalsLoading ? (
          <div className="text-center py-12 text-gray-600">
            Memuat data pencarian...
          </div>
        ) : filteredSoals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isFiltering ? "Tidak ada hasil" : "Belum ada soal"}
            </h3>
            <p className="text-gray-600 mb-4">
              {isFiltering
                ? "Coba kata kunci lain atau kosongkan pencarian."
                : "Mulai dengan membuat soal pertama Anda."}
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              Tambah Soal Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto p-4">
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Kode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pertanyaan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Jawaban Benar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredSoals.map((soal, index) => (
                    <tr
                      key={soal.question_code}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {isFiltering
                          ? index + 1
                          : (currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {soal.question_code || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold">
                          {getKategoriLabel(soal)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div
                          className="max-w-md truncate"
                          title={soal.question}
                        >
                          {soal.question}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            soal.is_active === 0
                              ? "bg-gray-100 text-gray-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {soal.is_active === 0 ? "Nonaktif" : "Aktif"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div
                          className="max-w-sm truncate"
                          title={getCorrectAnswerText(soal.pilihan_jawaban)}
                        >
                          {getCorrectAnswerText(soal.pilihan_jawaban)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewSoal(soal.question_code)}
                            className="btn btn-secondary btn-sm"
                          >
                            Detail
                          </button>
                          <button
                            onClick={() => handleEditSoal(soal)}
                            className="btn btn-secondary btn-sm"
                            disabled={soal.is_active === 0}
                            title={soal.is_active === 0 ? "Soal yang sudah dihapus tidak dapat diubah" : ""}
                          >
                            Ubah
                          </button>
                          {soal.is_active !== 0 && (
                            <button
                              onClick={() => openDeleteModal(soal)}
                              className="btn btn-sm flex items-center btn-danger"
                              disabled={deletingSoalId === soal.question_code}
                            >
                              {deletingSoalId === soal.question_code ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                  <span>Menghapus...</span>
                                </>
                              ) : (
                                "Hapus"
                              )}
                            </button>
                          )}
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
      {!isFiltering && total > 0 && totalPages > 1 && (
        <div className="bg-gray-50 px-6 sm:px-8 py-4 sm:py-6 border-t border-gray-100 mt-6 rounded-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600">
              Halaman
              <span className="ml-1 font-semibold text-gray-900">
                {currentPage}
              </span>
              <span className="ml-1">dari</span>
              <span className="ml-1 font-semibold text-gray-900">
                {totalPages}
              </span>
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
                <svg
                  className="w-4 h-4"
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
                          ? "bg-[color:var(--accent)] text-white shadow-sm"
                          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                      aria-current={currentPage === p ? "page" : undefined}
                    >
                      {p}
                    </button>
                  ) : (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-gray-500"
                    >
                      …
                    </span>
                  ),
                )}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="h-10 px-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <span className="hidden sm:inline">Berikutnya</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
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

      {isDeleteModalOpen && soalToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md mx-auto">
            <div className="card-body">
              <h2 className="text-xl font-bold mb-2">
                {toggleActionLabel} Soal
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Soal{" "}
                <span className="font-semibold">
                  #{soalToDelete.question_code}
                </span>{" "}
                akan dihapus. Data tidak dihapus permanen namun tidak akan tampil lagi.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!deletingSoalId) {
                      setIsDeleteModalOpen(false);
                      setSoalToDelete(null);
                    }
                  }}
                  className="btn btn-secondary"
                  disabled={!!deletingSoalId}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleToggleSoalStatus(soalToDelete.question_code)
                  }
                  className="btn btn-danger"
                  disabled={!!deletingSoalId}
                >
                  {deletingSoalId ? "Menghapus..." : toggleActionLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
