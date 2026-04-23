import { useCallback, useEffect, useState } from "react";
import PageHeader from "../components/PageHeader.tsx";
import Section from "../components/Section.tsx";
import { useToast } from "../utils/useToast";
import {
  createKategoriSoal,
  getKategoriSoals,
  updateKategoriSoal,
} from "../lib/api";
import type { KategoriSoal, CreateKategoriSoalRequest } from "../lib/api";

export default function KategoriSoalPage() {
  const { showSuccess, showError } = useToast();
  const [kategoriSoals, setKategoriSoals] = useState<KategoriSoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKategori, setNewKategori] = useState<CreateKategoriSoalRequest>({
    category_name: "",
    description: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingKategori, setEditingKategori] = useState<KategoriSoal | null>(
    null,
  );
  const [isUpdating, setIsUpdating] = useState(false);


  const fetchKategori = useCallback(
    async (currentPage: number = page) => {
      setLoading(true);
      setError(null);
      try {
        const response = await getKategoriSoals(currentPage, 10);
        if (response?.success && response.data) {
          const list = Array.isArray(response.data)
            ? response.data
            : response.data.data;
          setKategoriSoals(list || []);
          if (!Array.isArray(response.data) && response.data.total_pages) {
            setTotalPages(response.data.total_pages);
          } else {
            setTotalPages(1);
          }
        } else {
          setError(response?.message || "Gagal memuat kategori soal.");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [page],
  );

  useEffect(() => {
    fetchKategori();
  }, [fetchKategori]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const payload: CreateKategoriSoalRequest = {
        category_name: newKategori.category_name.trim(),
        ...(newKategori.description?.trim()
          ? { description: newKategori.description.trim() }
          : {}),
      };
      const response = await createKategoriSoal(payload);
      if (response?.success) {
        showSuccess(`Kategori "${payload.category_name}" berhasil dibuat!`);
        setIsCreateModalOpen(false);
        setNewKategori({ category_name: "", description: "" });
        await fetchKategori(1);
        setPage(1);
      } else {
        showError(response?.message || "Gagal membuat kategori soal.");
      }
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKategori) return;
    setIsUpdating(true);
    try {
      const payload = {
        category_name: editingKategori.category_name.trim(),
        ...(editingKategori.description?.trim()
          ? { description: editingKategori.description.trim() }
          : {}),
      };
      const response = await updateKategoriSoal(
        editingKategori.category_name,
        payload,
      );
      if (response?.success) {
        showSuccess(`Kategori "${payload.category_name}" berhasil diperbarui!`);
        setIsEditModalOpen(false);
        setEditingKategori(null);
        await fetchKategori(page);
      } else {
        showError(response?.message || "Gagal memperbarui kategori.");
      }
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setIsUpdating(false);
    }
  };



  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewKategori((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!editingKategori) return;
    const { name, value } = e.target;
    setEditingKategori((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const openEditModal = (kategori: KategoriSoal) => {
    setEditingKategori(kategori);
    setIsEditModalOpen(true);
  };

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

  return (
    <>
      <PageHeader
        title="Kategori Soal"
        description="Kelola kategori soal untuk bank soal."
        actions={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
          >
            Tambah Kategori
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
              <div className="p-4 border-b">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari Kategori
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Cari berdasarkan nama atau deskripsi..."
                    aria-label="Cari kategori"
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
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama</th>
                    <th>Deskripsi</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {kategoriSoals
                    .filter((k) => {
                      const q = search.trim().toLowerCase();
                      if (!q) return true;
                      return (
                        k.category_name.toLowerCase().includes(q) ||
                        (k.description
                          ? k.description.toLowerCase().includes(q)
                          : false)
                      );
                    })
                    .map((kategori) => (
                      <tr key={kategori.category_name}>
                        <td>{kategori.category_name}</td>
                        <td className="font-medium text-gray-900">
                          {kategori.category_name}
                        </td>
                        <td>{kategori.description || "-"}</td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(kategori)}
                              className="btn btn-secondary btn-sm"
                            >
                              Ubah
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {kategoriSoals.filter((k) => {
                    const q = search.trim().toLowerCase();
                    if (!q) return false;
                    return !(
                      k.category_name.toLowerCase().includes(q) ||
                      (k.description
                        ? k.description.toLowerCase().includes(q)
                        : false)
                    );
                  }).length === kategoriSoals.length &&
                    search.trim() !== "" && (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-8 text-gray-600"
                        >
                          Tidak ada kategori yang cocok dengan kata kunci "
                          {search}
                          ".
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
                    <span className="ml-1 font-semibold text-gray-900">
                      {page}
                    </span>
                    <span className="ml-1">dari</span>
                    <span className="ml-1 font-semibold text-gray-900">
                      {totalPages}
                    </span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                    <button
                      onClick={() => setPage(1)}
                      disabled={page === 1 || loading}
                      className="h-10 px-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      aria-label="Halaman pertama"
                    >
                      {"<<"}
                    </button>
                    <button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1 || loading}
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
                      {getPageNumbers(totalPages, page, 5).map((p, idx) =>
                        typeof p === "number" ? (
                          <button
                            key={`page-${p}`}
                            onClick={() => setPage(p)}
                            className={`h-10 w-10 rounded-xl text-sm font-semibold transition-all ${
                              page === p
                                ? "bg-[color:var(--accent)] text-white shadow-sm"
                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                            aria-current={page === p ? "page" : undefined}
                          >
                            {p}
                          </button>
                        ) : (
                          <span
                            key={`ellipsis-${idx}`}
                            className="px-2 text-gray-500"
                          >
                            ...
                          </span>
                        ),
                      )}
                    </div>
                    <button
                      onClick={() =>
                        setPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={page === totalPages || loading}
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
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages || loading}
                      className="h-10 px-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      aria-label="Halaman terakhir"
                    >
                      {">>"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Section>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">Buat Kategori Soal</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nama Kategori
                </label>
                <input
                  type="text"
                  id="name"
                  name="category_name"
                  value={newKategori.category_name}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                  disabled={isCreating}
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Deskripsi (opsional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newKategori.description || ""}
                  onChange={handleInputChange}
                  className="input w-full"
                  rows={3}
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

      {isEditModalOpen && editingKategori && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">Ubah Kategori Soal</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label
                  htmlFor="edit-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nama Kategori
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="category_name"
                  value={editingKategori.category_name}
                  onChange={handleEditInputChange}
                  className="input w-full"
                  required
                  disabled={isUpdating}
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="edit-description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Deskripsi (opsional)
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={editingKategori.description || ""}
                  onChange={handleEditInputChange}
                  className="input w-full"
                  rows={3}
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
