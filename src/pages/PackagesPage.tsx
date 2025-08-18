import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getPakets, deletePaket } from "../lib/api";
import type { Paket } from "../lib/api";
import PageHeader from "../components/PageHeader";
import Section from "../components/Section";

export default function PackagesPage() {
  const [pakets, setPakets] = useState<Paket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPakets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPakets(page, 10);
      if (response.success && response.data) {
        setPakets(response.data.data);
        setTotalPages(response.data.total_pages);
      } else {
        setError(response.message || "Gagal memuat daftar paket.");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPakets();
  }, [fetchPakets]);

  const handleDelete = async (paketId: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus paket ini?")) {
      try {
        await deletePaket(paketId);
        if (pakets.length === 1 && page > 1) {
          setPage((p) => p - 1);
        } else {
          fetchPakets();
        }
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  return (
    <div className="p-6">
      <PageHeader title="Paket Ujian" />
      <Section>
        <div className="card">
          <div className="card-body">
            {loading && <p>Memuat...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && (
              <>
                <div className="space-y-4">
                  {pakets.map((paket) => (
                    <div
                      key={paket.id}
                      className="border p-4 rounded-md flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">{paket.name}</p>
                        <p className="text-sm text-gray-500">{paket.description}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Link
                          to={`/paket/${paket.id}`}
                          className="text-primary-500 hover:underline"
                        >
                          Lihat Paket
                        </Link>
                        <button
                          onClick={() => handleDelete(paket.id)}
                          className="text-red-500 hover:underline"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn btn-secondary"
                  >
                    Sebelumnya
                  </button>
                  <span>
                    Halaman {page} dari {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn btn-secondary"
                  >
                    Berikutnya
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
