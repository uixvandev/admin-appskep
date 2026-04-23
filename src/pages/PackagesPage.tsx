import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getPakets, deletePaket } from "../lib/api";
import type { Paket } from "../lib/api";
import PageHeader from "../components/PageHeader.tsx";
import Section from "../components/Section.tsx";

export default function PackagesPage() {
  const isInactive = (value: unknown) => String(value ?? "").trim() === "0";
  const [pakets, setPakets] = useState<Paket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [paketToDelete, setPaketToDelete] = useState<Paket | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toggleActionLabel, setToggleActionLabel] = useState<"Hapus">("Hapus");

  const fetchPakets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPakets(page, 10);
      if (response.success && response.data) {
        const rawList = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        const normalizedList = rawList.map((paket: Paket) => {
          const resolvedCode =
            (typeof paket.package_code === "string" &&
              paket.package_code.trim()) ||
            (typeof paket.kode_paket === "string" && paket.kode_paket.trim()) ||
            "";
          return {
            ...paket,
            package_code: resolvedCode,
          };
        });
        setPakets(
          normalizedList.filter((paket: Paket) => Boolean(paket.package_code)),
        );
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
    setToggleActionLabel("Hapus");
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!paketToDelete) return;
    setIsDeleting(true);
    try {
        const packageCode =
          paketToDelete.package_code || paketToDelete.kode_paket || "";
        if (!packageCode) {
          throw new Error("package_code tidak ditemukan untuk paket ini");
        }
        await deletePaket(packageCode);

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
                      key={paket.package_code || paket.kode_paket || paket.name}
                      className="border p-4 rounded-md flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">{paket.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Kode: {paket.package_code || paket.kode_paket || "-"}
                        </p>
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isInactive(paket.is_active)
                                ? "bg-gray-100 text-gray-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {isInactive(paket.is_active) ? "Nonaktif" : "Aktif"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          {paket.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Link
                          to={`/paket/${paket.package_code || paket.kode_paket || ""}`}
                          className="text-primary-500 hover:underline"
                        >
                          Detail Paket
                        </Link>
                        {!isInactive(paket.is_active) && (
                          <button
                            onClick={() => openDeleteModal(paket)}
                            className="text-red-500 hover:underline"
                          >
                            Hapus
                          </button>
                        )}
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
              <h2 className="text-xl font-bold mb-2">
                {toggleActionLabel} Paket
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Paket{" "}
                <span className="font-semibold">{paketToDelete.name}</span> akan{" "}
                dihapus permanen (soft delete).
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
                  {isDeleting ? "Menghapus..." : toggleActionLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
