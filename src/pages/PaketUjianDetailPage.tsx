import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import * as api from "../lib/api";
import PageHeader from "../components/PageHeader";
import Section from "../components/Section";

export default function PaketUjianDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [paket, setPaket] = useState<api.Paket | null>(null);
  const [soals, setSoals] = useState<api.Soal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          <Link
            to={`/paket/${id}/tambah-soal`}
            className="btn btn-primary text-white hover:text-white focus-visible:text-white"
          >
            Tambah Soal
          </Link>
        }
      />
      <Section>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Durasi: {paket.duration} menit</span>
              <span>Total Soal: {paket.total_questions}</span>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Daftar Soal ({soals.length})
              </h2>

              {soals.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg text-gray-500">
                  <p className="font-semibold">Belum ada soal dalam paket ini.</p>
                  <p className="text-sm mt-2">
                    Klik "Tambah Soal" untuk menambahkan soal pertama.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {soals.map((soal, index) => (
                    <div
                      key={soal.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium text-gray-900 leading-relaxed">
                          {index + 1}. {soal.question}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                        {soal.pilihan_jawaban.map((pilihan, pilihanIndex) => (
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
                        ))}
                      </div>

                      {soal.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md text-sm border border-blue-200">
                          <strong className="text-blue-800">Penjelasan:</strong>
                          <p className="text-blue-700 mt-1">{soal.explanation}</p>
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
    </div>
  );
}
