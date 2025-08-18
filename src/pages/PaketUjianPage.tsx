import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPakets, deletePaket, createPaket, updatePaket } from "../lib/api";
import type { Paket } from "../lib/api";
import CreatePaketModal from "../components/CreatePaketModal";
import EditPaketModal from "../components/EditPaketModal";
import PageHeader from "../components/PageHeader";

// Local types aligned with modal prop shapes
type CreatePaketFormData = {
  name: string;
  description: string;
  duration: number;
};

type EditingPaket = {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  maxAttempts: number;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function PaketUjianPage() {
  const [pakets, setPakets] = useState<Paket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPaket, setEditingPaket] = useState<EditingPaket | null>(null);

  useEffect(() => {
    const fetchPakets = async () => {
      setLoading(true);
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
    };

    fetchPakets();
  }, [page]);

  // Build compact page list with ellipsis similar to UsersPage
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

  // Handler untuk create paket
  const handleCreatePaket = async (data: CreatePaketFormData) => {
    try {
      // Map form data to API payload shape
      await createPaket({
        name: data.name,
        description: data.description,
        duration: data.duration,
      });
      setShowCreateModal(false);
      // Refresh data
      window.location.reload();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Handler untuk update paket
  const handleUpdatePaket = async (data: Partial<EditingPaket>) => {
    if (!editingPaket) return;
    try {
      // Map partial form data to API payload shape with fallbacks
      await updatePaket(editingPaket.id, {
        name: data.name ?? editingPaket.name,
        description: data.description ?? editingPaket.description,
        duration: data.duration ?? editingPaket.duration,
      });
      setShowEditModal(false);
      setEditingPaket(null);
      window.location.reload();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Handler untuk delete paket
  const handleDeletePaketModal = async (id: number) => {
    try {
      await deletePaket(id);
      setShowEditModal(false);
      setEditingPaket(null);
      window.location.reload();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Mapping Paket (API) ke PaketData (modal) dengan default value
  const openEditModal = (paket: Paket) => {
    setEditingPaket({
      id: paket.id,
      name: paket.name,
      description: paket.description,
      price: 0, // default
      duration: paket.duration,
      maxAttempts: 1, // default
      category: "", // default
      isActive: true, // default
      createdAt: new Date().toISOString(), // default
      updatedAt: new Date().toISOString(), // default
    });
    setShowEditModal(true);
  };

  // Tetap gunakan handler lama untuk tombol list
  const handleDeletePaket = async (paketId: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus paket ini?")) {
      try {
        await deletePaket(paketId);
        if (pakets.length === 1 && page > 1) {
          setPage((p) => p - 1);
        } else {
          window.location.reload();
        }
      } catch (err) {
        setError((err as Error).message);
        alert("Gagal menghapus paket: " + (err as Error).message);
      }
    }
  };

  return (
    <>
      <PageHeader
        title="Paket Ujian"
        description="Kelola semua paket ujian yang tersedia."
        actions={
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            Buat Paket Baru
          </button>
        }
      />
      <div className="card">
        <div className="card-body">
          {loading && <p className="text-center py-10">Memuat...</p>}
          {error && <p className="text-red-500 text-center py-10">{error}</p>}

          {!loading && !error && (
            <>
              {/* Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cari Paket Ujian</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Cari berdasarkan nama atau deskripsi..."
                    aria-label="Cari paket"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* List */}
              <div className="space-y-4">
                {pakets
                  .filter((p) => {
                    const q = search.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      p.name.toLowerCase().includes(q) ||
                      (p.description ? p.description.toLowerCase().includes(q) : false)
                    );
                  })
                  .map((paket) => (
                  <div
                    key={paket.id}
                    className="border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-primary-600">
                        {paket.name}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {paket.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Durasi: {paket.duration} menit | Total Soal: {" "}
                        {paket.total_questions}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/paket/${paket.id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        Detail
                      </Link>
                      <button
                        onClick={() => openEditModal(paket)}
                        className="btn btn-secondary btn-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePaket(paket.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
                {pakets.filter((p) => {
                  const q = search.trim().toLowerCase();
                  if (!q) return false; // when no search, do not show empty state here
                  return !(
                    p.name.toLowerCase().includes(q) ||
                    (p.description ? p.description.toLowerCase().includes(q) : false)
                  );
                }).length === pakets.length && search.trim() !== "" && (
                  <div className="text-center py-10 border-2 border-dashed rounded-lg text-gray-600">
                    Tidak ada paket yang cocok dengan kata kunci "{search}".
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 sm:px-8 py-4 sm:py-6 border-t border-gray-100 mt-6 rounded-b-xl">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-gray-600">
                      Halaman
                      <span className="ml-1 font-semibold text-gray-900">{page}</span>
                      <span className="ml-1">dari</span>
                      <span className="ml-1 font-semibold text-gray-900">{totalPages}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                      <button
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                        className="h-10 px-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        aria-label="Halaman pertama"
                      >
                        «
                      </button>
                      <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className="h-10 px-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="hidden sm:inline">Sebelumnya</span>
                      </button>
                      <div className="flex items-center gap-1">
                        {getPageNumbers(totalPages, page, 5).map((p, idx) =>
                          typeof p === "number" ? (
                            <button
                              key={`page-${p}`}
                              onClick={() => setPage(p)}
                              className={`h-10 w-10 rounded-xl text-sm font-semibold transition-all ${
                                page === p
                                  ? "bg-primary-600 text-white shadow-sm"
                                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                              }`}
                              aria-current={page === p ? "page" : undefined}
                            >
                              {p}
                            </button>
                          ) : (
                            <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">…</span>
                          )
                        )}
                      </div>
                      <button
                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages}
                        className="h-10 px-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      >
                        <span className="hidden sm:inline">Berikutnya</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setPage(totalPages)}
                        disabled={page === totalPages}
                        className="h-10 px-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        aria-label="Halaman terakhir"
                      >
                        »
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreatePaketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePaket}
      />

      <EditPaketModal
        isOpen={showEditModal}
        paket={editingPaket}
        onClose={() => {
          setShowEditModal(false);
          setEditingPaket(null);
        }}
        onUpdate={handleUpdatePaket}
        onDelete={handleDeletePaketModal}
      />
    </>
  );
}
