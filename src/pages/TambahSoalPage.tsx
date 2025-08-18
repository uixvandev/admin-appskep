import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../lib/api";
import PageHeader from "../components/PageHeader";

export default function TambahSoalPage() {
  const navigate = useNavigate();
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
        <div className="mb-4">
          <label htmlFor="question" className="block text-gray-700 font-semibold mb-2">
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
          <label htmlFor="explanation" className="block text-gray-700 font-semibold mb-2">
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
          <label className="block text-gray-700 font-semibold mb-4">Pilihan Jawaban</label>
          {options.map((option, index) => (
            <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-600 font-medium">Opsi {String.fromCharCode(65 + index)}</label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={option.is_correct}
                    onChange={(e) => handleOptionChange(index, "is_correct", e.target.checked)}
                    className="form-checkbox"
                  />
                  <span className="ml-2 text-sm text-gray-600">Jawaban Benar</span>
                </label>
              </div>
              <input
                type="text"
                value={option.option_text}
                onChange={(e) => handleOptionChange(index, "option_text", e.target.value)}
                className="input w-full"
                placeholder={`Masukkan opsi ${String.fromCharCode(65 + index)}`}
                required
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end space-x-4">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
            Batal
          </button>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? "Menyimpan..." : "Simpan Soal"}
          </button>
        </div>
      </form>
        </div>
      </div>
    </div>
  );
}
