import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getKelas,
  createKelas,
  updateKelas,
  deleteKelas,
} from "../lib/api";
import type { Kelas, CreateKelasRequest } from "../lib/api";
import PageHeader from "../components/PageHeader.tsx";
import Section from "../components/Section.tsx";
import { useToast } from "../utils/useToast";

export default function KelasPage() {
  type KelasFormState = {
    class_code: string;
    name: string;
    description: string;
    price: string;
  };

  type EditKelasFormState = {
    class_code: string;
    name: string;
    description: string;
    price: string;
  };

  const { showSuccess, showError } = useToast();
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKelas, setNewKelas] = useState<KelasFormState>({
    class_code: "",
    name: "",
    description: "",
    price: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<EditKelasFormState | null>(
    null,
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [kelasToDelete, setKelasToDelete] = useState<Kelas | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toggleActionLabel, setToggleActionLabel] = useState<"Hapus">("Hapus");

  const fetchKelas = useCallback(
    async (currentPage: number = page) => {
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
    },
    [page],
  );

  useEffect(() => {
    fetchKelas();
  }, [fetchKelas]);

  const handleCreateKelas = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const priceValue = Number(newKelas.price);
      if (!Number.isFinite(priceValue)) {
        showError("Harga harus berupa angka.");
        setIsCreating(false);
        return;
      }
      const payload: CreateKelasRequest = {
        class_code: newKelas.class_code.trim(),
        name: newKelas.name,
        description: newKelas.description,
        price: priceValue,
      };
      const response = await createKelas(payload);
      if (response.success) {
        showSuccess(`Kelas "${newKelas.name}" berhasil dibuat!`);
        setIsCreateModalOpen(false);
        setNewKelas({ class_code: "", name: "", description: "", price: "" });
        await fetchKelas(1);
        setPage(1);
      } else {
        showError(response.message || "Gagal membuat kelas baru");
      }
    } catch (err) {
      showError("Terjadi kesalahan: " + (err as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateKelas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKelas) return;

    setIsUpdating(true);
    try {
      const priceValue = Number(editingKelas.price);
      if (!Number.isFinite(priceValue)) {
        showError("Harga harus berupa angka.");
        setIsUpdating(false);
        return;
      }
      const payload = {
        class_code: editingKelas.class_code.trim(),
        name: editingKelas.name,
        description: editingKelas.description,
        price: priceValue,
      };
      const response = await updateKelas(
        editingKelas.class_code.trim(),
        payload,
      );

      if (response.success) {
        showSuccess(`Kelas "${editingKelas.name}" berhasil diperbarui!`);
        setIsEditModalOpen(false);
        setEditingKelas(null);
        await fetchKelas(page);
      } else {
        showError(response.message || "Gagal memperbarui kelas");
      }
    } catch (err) {
      showError("Terjadi kesalahan: " + (err as Error).message);
    } finally {
      setIsUpdating(false);
    }
  };

  const openDeleteModal = (kelasItem: Kelas) => {
    setKelasToDelete(kelasItem);
    setToggleActionLabel("Hapus");
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteKelas = async () => {
    if (!kelasToDelete) return;
    setIsDeleting(true);
    try {
      const currentIsActive = kelasToDelete.is_active === 0 ? 0 : 1;
      if (currentIsActive === 1) {
        await deleteKelas(kelasToDelete.class_code);
      } else {
        throw new Error("Kelas ini sudah dihapus");
      }

      showSuccess(
        `Kelas "${kelasToDelete.name}" berhasil dihapus!`,
      );
      await fetchKelas(page);
      setIsDeleteModalOpen(false);
      setKelasToDelete(null);
    } catch (err) {
      showError(
        `Gagal menghapus kelas: ` + (err as Error).message,
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewKelas((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!editingKelas) return;
    const { name, value } = e.target;
    setEditingKelas((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const openEditModal = (k: Kelas) => {
    setEditingKelas({
      class_code: k.class_code,
      name: k.name,
      description: k.description,
      price: Number.isFinite(k.price) ? String(k.price) : "",
    });
    setIsEditModalOpen(true);
  };

  // Build compact page list with ellipsis similar to UsersPage
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
        title="Manajemen Kelas"
        actions={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
          >
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari Kelas
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Cari berdasarkan nama atau deskripsi..."
                    aria-label="Cari kelas"
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
                    <th>Kode</th>
                    <th>Nama</th>
                    <th>Status</th>
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
                        (k.class_code
                          ? k.class_code.toLowerCase().includes(q)
                          : false) ||
                        (k.description
                          ? k.description.toLowerCase().includes(q)
                          : false)
                      );
                    })
                    .map((k) => (
                      <tr key={k.class_code}>
                        <td>{k.class_code}</td>
                        <td className="font-medium text-gray-900">{k.name}</td>
                        <td>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                              k.is_active === 0
                                ? "bg-gray-100 text-gray-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {k.is_active === 0 ? "Nonaktif" : "Aktif"}
                          </span>
                        </td>
                        <td>{k.description}</td>
                        <td>Rp{k.price.toLocaleString("id-ID")}</td>
                        <td>
                          <div className="flex gap-2">
                            <Link
                              to={`/kelas/${k.class_code}`}
                              className="btn btn-secondary btn-sm"
                            >
                              Detail
                            </Link>
                            <button
                              onClick={() => openEditModal(k)}
                              className="btn btn-secondary btn-sm"
                              disabled={k.is_active === 0}
                              title={k.is_active === 0 ? "Kelas yang sudah dihapus tidak dapat diubah" : ""}
                            >
                              Ubah
                            </button>
                            {k.is_active !== 0 && (
                              <button
                                onClick={() => openDeleteModal(k)}
                                className="btn btn-sm btn-danger"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  {kelas.filter((k) => {
                    const q = search.trim().toLowerCase();
                    if (!q) return false; // don't show empty row if search is empty
                    return !(
                      k.name.toLowerCase().includes(q) ||
                      (k.class_code
                        ? k.class_code.toLowerCase().includes(q)
                        : false) ||
                      (k.description
                        ? k.description.toLowerCase().includes(q)
                        : false)
                    );
                  }).length === kelas.length &&
                    search.trim() !== "" && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-8 text-gray-600"
                        >
                          Tidak ada kelas yang cocok dengan kata kunci "{search}
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
                      «
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
                            …
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">Buat Kelas Baru</h2>
            <form onSubmit={handleCreateKelas}>
              <div className="mb-4">
                <label
                  htmlFor="class_code"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Kode Kelas
                </label>
                <input
                  type="text"
                  id="class_code"
                  name="class_code"
                  value={newKelas.class_code}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Contoh: KLS-001"
                  required
                  disabled={isCreating}
                />
              </div>
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">Ubah Kelas</h2>
            <form onSubmit={handleUpdateKelas}>
              <div className="mb-4">
                <label
                  htmlFor="edit-class_code"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Kode Kelas
                </label>
                <input
                  type="text"
                  id="edit-class_code"
                  name="class_code"
                  value={editingKelas.class_code}
                  className="input w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                  placeholder="Contoh: KLS-001"
                  required
                  disabled
                  readOnly
                />
              </div>
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

      {isDeleteModalOpen && kelasToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">
              {toggleActionLabel} Kelas
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Kelas <span className="font-semibold">{kelasToDelete.name}</span>{" "}
              akan dihapus. Data tidak dihapus permanen namun tidak akan tampil lagi.
            </p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  if (!isDeleting) {
                    setIsDeleteModalOpen(false);
                    setKelasToDelete(null);
                  }
                }}
                className="btn btn-secondary"
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteKelas}
                className="btn btn-danger"
                disabled={isDeleting}
              >
                {isDeleting ? "Menghapus..." : toggleActionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
