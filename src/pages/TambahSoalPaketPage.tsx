import { useEffect, useState, useCallback, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import * as api from "../lib/api";
import PageHeader from "../components/PageHeader";

export default function TambahSoalPaketPage() {
  const { id: paketId } = useParams<{ id: string }>();
  const [availableSoals, setAvailableSoals] = useState<api.Soal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
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
            soalsInPaket.map((s: api.Soal) => s.id)
          );

          // Filter out soals that are already in the paket
          const filteredSoals = allSoals.filter(
            (s: api.Soal) => !soalsInPaketIds.has(s.id)
          );
          setAvailableSoals(filteredSoals);
        } else {
          setError(allSoalsResponse.message || "Gagal memuat daftar soal.");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Terjadi kesalahan jaringan.";
        setError(message);
      } finally {
        setLoading(false);
      }
  }, [paketId]);

  useEffect(() => {
    fetchSoals();
  }, [fetchSoals]);

  const handleAssignSoal = async (soalId: number) => {
    if (!paketId) return;
    setAssigning(soalId);
    try {
      const response = await api.assignSoalToPaket({
        paket_id: parseInt(paketId),
        soal_id: soalId,
      });

      if (response.success) {
        alert("Soal berhasil ditambahkan ke paket.");
        // Remove the assigned soal from the list
        setAvailableSoals((prevSoals) =>
          prevSoals.filter((s) => s.id !== soalId)
        );
      } else {
        alert(`Gagal menambahkan soal: ${response.message}`);
      }
    } catch (err) {
      alert(`Terjadi kesalahan: ${(err as Error).message}`);
    } finally {
      setAssigning(null);
    }
  };

  // Modal helpers for creating a new soal
  const resetCreateForm = () => {
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
    value: string | boolean
  ) => {
    setOptions((prev) =>
      prev.map((option, i) => (i === index ? { ...option, [field]: value } : option))
    );
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
      const res = await api.createSoal({ question, explanation, pilihan_jawaban: options });
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
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              Buat Soal Baru
            </button>
          </div>
        }
      />
      <div className="card">
        <div className="card-body">
        <div className="space-y-3">
          {availableSoals.length > 0 ? (
            availableSoals.map((soal) => (
              <div
                key={soal.id}
                className="border p-4 rounded-lg flex justify-between items-center bg-white hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold text-gray-800">{soal.question}</p>
                  <p className="text-sm text-gray-500 mt-1">ID Soal: {soal.id}</p>
                </div>
                <button
                  onClick={() => handleAssignSoal(soal.id)}
                  disabled={assigning === soal.id}
                  className="btn btn-primary btn-sm"
                >
                  {assigning === soal.id ? "Menambahkan..." : "Tambahkan"}
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <p className="font-semibold text-gray-700">Tidak ada soal baru yang tersedia.</p>
              <p className="text-sm text-gray-500 mt-2">
                Semua soal sudah ada di dalam paket ini atau belum ada soal yang dibuat.
              </p>
            </div>
          )}
        </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay overlay-enter" role="dialog" aria-modal="true">
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                <div className="form-control">
                  <label htmlFor="q" className="form-label">Pertanyaan</label>
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
                  <label htmlFor="exp" className="form-label">Penjelasan (opsional)</label>
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
                      <div key={idx} className="rounded-lg border p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-gray-600 font-medium">
                            Opsi {String.fromCharCode(65 + idx)}
                          </label>
                          <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              checked={opt.is_correct}
                              onChange={(e) => handleOptionChange(idx, "is_correct", e.target.checked)}
                            />
                            Jawaban Benar
                          </label>
                        </div>
                        <input
                          type="text"
                          className="form-input w-full"
                          placeholder={`Masukkan opsi ${String.fromCharCode(65 + idx)}`}
                          value={opt.option_text}
                          onChange={(e) => handleOptionChange(idx, "option_text", e.target.value)}
                          required
                        />
                      </div>
                    ))}
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
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
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
