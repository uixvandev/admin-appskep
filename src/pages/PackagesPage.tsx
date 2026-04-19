import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getPakets, deletePaket } from "../lib/api";
import type { Paket } from "../lib/api";
import PageHeader from "../components/PageHeader.tsx";
import Section from "../components/Section.tsx";

export default function PackagesPage() {
  const [pakets, setPakets] = useState<Paket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [paketToDelete, setPaketToDelete] = useState<Paket | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const openDeleteModal = (paket: Paket) => {
    setPaketToDelete(paket);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!paketToDelete) return;
    setIsDeleting(true);
    try {
      await deletePaket(paketToDelete.id);
      if (pakets.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchPakets();
      }
      setIsDeleteModalOpen(false);
      setPaketToDelete(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6">
      <PageHeader title="Manajemen Try Out" />
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
                        <p className="text-xs text-gray-500 mt-1">
                          Kode: {paket.kode_paket || "-"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {paket.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Link
                          to={`/paket/${paket.id}`}
                          className="text-primary-500 hover:underline"
                        >
                          Detail Paket
                        </Link>
                        <button
                          onClick={() => openDeleteModal(paket)}
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

      {isDeleteModalOpen && paketToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md mx-auto">
            <div className="card-body">
              <h2 className="text-xl font-bold mb-2">Hapus Paket</h2>
              <p className="text-sm text-gray-600 mb-6">
                Paket{" "}
                <span className="font-semibold">{paketToDelete.name}</span> akan
                dihapus permanen. Tindakan ini tidak bisa dibatalkan.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!isDeleting) {
                      setIsDeleteModalOpen(false);
                      setPaketToDelete(null);
                    }
                  }}
                  className="btn btn-secondary"
                  disabled={isDeleting}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="btn btn-danger"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
