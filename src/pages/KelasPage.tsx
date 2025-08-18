import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getKelas, createKelas, updateKelas, deleteKelas } from "../lib/api";
import type { Kelas, CreateKelasRequest } from "../lib/api";
import PageHeader from "../components/PageHeader";
import Section from "../components/Section";

export default function KelasPage() {
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKelas, setNewKelas] = useState<CreateKelasRequest>({
    name: "",
    description: "",
    price: 0,
  });
  const [isCreating, setIsCreating] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchKelas = useCallback(async (currentPage: number = page) => {
    setLoading(true);
    try {
      const response = await getKelas(currentPage);
      if (response.success && response.data) {
        setKelas(response.data.data);
        setTotalPages(response.data.total_pages);
      } else {
        setError(response.message || "Gagal memuat daftar kelas");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchKelas();
  }, [fetchKelas]);

  const handleCreateKelas = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const response = await createKelas(newKelas);
      if (response.success) {
        setIsCreateModalOpen(false);
        setNewKelas({ name: "", description: "", price: 0 });
        await fetchKelas(1);
        setPage(1);
      } else {
        alert(response.message || "Gagal membuat kelas baru");
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateKelas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKelas) return;

    setIsUpdating(true);
    try {
      const response = await updateKelas(editingKelas.id, {
        name: editingKelas.name,
        description: editingKelas.description,
        price: editingKelas.price,
      });

      if (response.success) {
        setIsEditModalOpen(false);
        setEditingKelas(null);
        await fetchKelas(page);
      } else {
        alert(response.message || "Gagal memperbarui kelas");
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteKelas = async (kelasId: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kelas ini?")) {
      try {
        await deleteKelas(kelasId);
        await fetchKelas(page);
      } catch (err) {
        alert((err as Error).message);
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewKelas((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!editingKelas) return;
    const { name, value } = e.target;
    setEditingKelas((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: name === "price" ? parseFloat(value) || 0 : value,
      };
    });
  };

  const openEditModal = (k: Kelas) => {
    setEditingKelas(k);
    setIsEditModalOpen(true);
  };

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

  return (
    <>
      <PageHeader
        title="Manajemen Kelas"
        actions={
          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
            Tambah Kelas
          </button>
        }
      />

      <Section>
        {loading ? (
          <p>Memuat...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="card">
            <div className="card-body p-0">
              {/* Search */}
              <div className="p-4 border-b">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cari Kelas</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Cari berdasarkan nama atau deskripsi..."
                    aria-label="Cari kelas"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama</th>
                    <th>Deskripsi</th>
                    <th>Harga</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {kelas
                    .filter((k) => {
                      const q = search.trim().toLowerCase();
                      if (!q) return true;
                      return (
                        k.name.toLowerCase().includes(q) ||
                        (k.description ? k.description.toLowerCase().includes(q) : false)
                      );
                    })
                    .map((k) => (
                    <tr key={k.id}>
                      <td>{k.id}</td>
                      <td className="font-medium text-gray-900">{k.name}</td>
                      <td>{k.description}</td>
                      <td>
                        Rp{k.price.toLocaleString("id-ID")}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Link
                            to={`/kelas/${k.id}`}
                            className="btn btn-secondary btn-sm"
                          >
                            Lihat
                          </Link>
                          <button
                            onClick={() => openEditModal(k)}
                            className="btn btn-secondary btn-sm"
                          >
                            Ubah
                          </button>
                          <button
                            onClick={() => handleDeleteKelas(k.id)}
                            className="btn btn-danger btn-sm"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {kelas.filter((k) => {
                    const q = search.trim().toLowerCase();
                    if (!q) return false; // don't show empty row if search is empty
                    return !(
                      k.name.toLowerCase().includes(q) ||
                      (k.description ? k.description.toLowerCase().includes(q) : false)
                    );
                  }).length === kelas.length && search.trim() !== "" && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-600">
                        Tidak ada kelas yang cocok dengan kata kunci "{search}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 sm:px-8 py-4 sm:py-6 border-t border-gray-100 mt-2 rounded-b-xl">
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
                      disabled={page === 1 || loading}
                      className="h-10 px-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      aria-label="Halaman pertama"
                    >
                      «
                    </button>
                    <button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1 || loading}
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
                      disabled={page === totalPages || loading}
                      className="h-10 px-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      <span className="hidden sm:inline">Berikutnya</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages || loading}
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
        )}
      </Section>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">Buat Kelas Baru</h2>
            <form onSubmit={handleCreateKelas}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nama Kelas
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newKelas.name}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                  disabled={isCreating}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newKelas.description}
                  onChange={handleInputChange}
                  className="input w-full"
                  rows={3}
                  required
                  disabled={isCreating}
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Harga
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={newKelas.price}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                  disabled={isCreating}
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={isCreating}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isCreating}
                >
                  {isCreating ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingKelas && (
        <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">Ubah Kelas</h2>
            <form onSubmit={handleUpdateKelas}>
              <div className="mb-4">
                <label
                  htmlFor="edit-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nama Kelas
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editingKelas.name}
                  onChange={handleEditInputChange}
                  className="input w-full"
                  required
                  disabled={isUpdating}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="edit-description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Deskripsi
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={editingKelas.description}
                  onChange={handleEditInputChange}
                  className="input w-full"
                  rows={3}
                  required
                  disabled={isUpdating}
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="edit-price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Harga
                </label>
                <input
                  type="number"
                  id="edit-price"
                  name="price"
                  value={editingKelas.price}
                  onChange={handleEditInputChange}
                  className="input w-full"
                  required
                  disabled={isUpdating}
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={isUpdating}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Memperbarui..." : "Perbarui"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
