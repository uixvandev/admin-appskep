import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as api from "../lib/api";
import PageHeader from "../components/PageHeader.tsx";

export default function TambahSoalPage() {
  const navigate = useNavigate();
  const [kodeSoal, setKodeSoal] = useState("");
  const [kategoriSoalId, setKategoriSoalId] = useState<number | "">("");
  const [kategoriSoals, setKategoriSoals] = useState<api.KategoriSoal[]>([]);
  const [kategoriLoading, setKategoriLoading] = useState(false);
  const [kategoriError, setKategoriError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [explanation, setExplanation] = useState("");
  const [options, setOptions] = useState([
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await api.createSoal({
        question,
        explanation,
        pilihan_jawaban: options,
        ...(kodeSoal.trim() ? { kode_soal: kodeSoal.trim() } : {}),
        ...(kategoriSoalId !== ""
          ? { kategori_soal_id: Number(kategoriSoalId) }
          : {}),
      });

      alert("Soal berhasil dibuat!");
      navigate("/questions"); // Redirect to the list of all questions
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-0">
      <PageHeader title="Buat Soal Baru" />
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="kode-soal"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Kode Soal (opsional)
                </label>
                <input
                  id="kode-soal"
                  type="text"
                  value={kodeSoal}
                  onChange={(e) => setKodeSoal(e.target.value)}
                  className="input w-full"
                  placeholder="Contoh: SOAL-001"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Kosongkan jika ingin otomatis dari sistem.
                </p>
              </div>
              <div>
                <label
                  htmlFor="kategori-soal"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Kategori Soal (opsional)
                </label>
                <select
                  id="kategori-soal"
                  className="input w-full"
                  value={kategoriSoalId === "" ? "" : String(kategoriSoalId)}
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
                  <p className="text-xs text-red-600 mt-1">{kategoriError}</p>
                )}
              </div>
            </div>
            <div className="mb-4">
              <label
                htmlFor="question"
                className="block text-gray-700 font-semibold mb-2"
              >
                Pertanyaan
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="input w-full"
                rows={4}
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="explanation"
                className="block text-gray-700 font-semibold mb-2"
              >
                Penjelasan
              </label>
              <textarea
                id="explanation"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="input w-full"
                rows={3}
                placeholder="Penjelasan untuk soal ini..."
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-4">
                Pilihan Jawaban
              </label>
              {options.map((option, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-gray-600 font-medium">
                      Opsi {String.fromCharCode(65 + index)}
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="correct-answer"
                          checked={option.is_correct}
                          onChange={() =>
                            handleOptionChange(index, "is_correct", true)
                          }
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          Jawaban Benar
                        </span>
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
                      handleOptionChange(index, "option_text", e.target.value)
                    }
                    className="input w-full"
                    placeholder={`Masukkan opsi ${String.fromCharCode(65 + index)}`}
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
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-secondary"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? "Menyimpan..." : "Simpan Soal"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
