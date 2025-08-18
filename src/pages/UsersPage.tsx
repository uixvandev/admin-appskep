import { useEffect, useState } from "react";
import * as api from "../lib/api";
import PageHeader from "../components/PageHeader";

export default function UsersPage() {
  const [users, setUsers] = useState<api.User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<api.User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<api.User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState<api.User | null>(null);
  const [updatingRole, setUpdatingRole] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const limit = 10;

  useEffect(() => {
    loadUsers(currentPage);
  }, [currentPage]);

  // Update useEffect untuk reset selectAll saat filter berubah
  useEffect(() => {
    setSelectAll(false);
    setSelectedUsers([]);
  }, [searchTerm, roleFilter, sortBy]);

  // Filter and sort users
  useEffect(() => {
    const filtered = users.filter((user: api.User) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });

    // Sort users
    filtered.sort((a: api.User, b: api.User) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "email":
          return a.email.localeCompare(b.email);
        case "role":
          return a.role.localeCompare(b.role);
        case "created":
          return (
            new Date(toDateInput(b.created_at)).getTime() -
            new Date(toDateInput(a.created_at)).getTime()
          );
        default:
          return 0;
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, sortBy]);

  async function loadUsers(page: number) {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getUsers(page, limit);
      if (response.success && response.data) {
        setUsers(response.data.data);
        setTotalPages(response.data.total_pages);
        setTotalItems(response.data.total_items);
      } else {
        setError(response.message || "Failed to load users");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.includes("authentication")) {
        // Token expired or invalid, redirect to login
        api.clearToken();
        window.location.href = "/";
      } else {
        setError(message || "Network error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  function toDateInput(value: unknown): string | number | Date {
    if (typeof value === "string" || typeof value === "number") return value;
    if (value instanceof Date) return value;
    return 0; // fallback to epoch if unknown/invalid
  }

  function formatDate(value: unknown) {
    return new Date(toDateInput(value)).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getRoleColor(role: string) {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "dosen":
        return "bg-blue-100 text-blue-800";
      case "mahasiswa":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function getRoleLabel(role: string) {
    switch (role) {
      case "admin":
        return "Administrator";
      case "dosen":
        return "Dosen";
      case "mahasiswa":
        return "Mahasiswa";
      default:
        return role;
    }
  }

  // Build compact page list with ellipsis for large total pages
  function getPageNumbers(
    total: number,
    current: number,
    max = 5
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

  async function handleDeleteUser(user: api.User) {
    setDeleting(user.id);
    try {
      await api.deleteUser(user.id);
      setUsers(users.filter((u) => u.id !== user.id));
      setShowDeleteModal(null);
      // Reload current page if it's empty
      if (users.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete user";
      setError(message);
    } finally {
      setDeleting(null);
    }
  }

  async function handleChangeRole(user: api.User, newRole: string) {
    setUpdatingRole(user.id);
    try {
      await api.updateUserRole(user.id, newRole);
      setUsers(
        users.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
      setShowRoleModal(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update user role";
      setError(message);
    } finally {
      setUpdatingRole(null);
    }
  }

  function handleSelectUser(userId: number) {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }

  function handleSelectAll() {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    }
    setSelectAll(!selectAll);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button
            onClick={() => loadUsers(currentPage)}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader title="Users" description="Manage user accounts and permissions" />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white card hover:shadow-lg transition-all duration-300">
            <div className="card-body flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-gray-900">{totalItems}</p>
              </div>
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white card hover:shadow-lg transition-all duration-300">
            <div className="card-body flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Administrators
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {
                    users.filter(
                      (u: api.User) => u.role.toLowerCase() === "admin"
                    ).length
                  }
                </p>
              </div>
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white card hover:shadow-lg transition-all duration-300">
            <div className="card-body flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Active Users
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.filter((u: api.User) => u.status === "active").length}
                </p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

      {/* Filters and Search */}
      <div className="bg-white card mb-6">
        <div className="card-body">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Users
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

              {/* Role Filter */}
              <div className="lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Administrator</option>
                  <option value="mahasiswa">Mahasiswa</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="role">Role</option>
                  <option value="created">Created Date</option>
                </select>
              </div>
            </div>
          </div>
        </div>

      {/* Users Table */}
      <div className="bg-white card">
        <div className="card-body">
            {/* Table Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Select All ({filteredUsers.length})
                  </span>
                </label>
                {selectedUsers.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedUsers.length} selected
                  </span>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-3"
                          />
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-600">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/users/${user.id}`}
                            className="text-primary-600 hover:text-primary-900 flex items-center gap-1"
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            View Details
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 sm:px-8 py-4 sm:py-6 border-t border-gray-100">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="hidden sm:inline">Showing </span>
                    <span className="font-semibold text-gray-900">
                      {(currentPage - 1) * limit + 1}
                    </span>
                    <span> - </span>
                    <span className="font-semibold text-gray-900">
                      {Math.min(currentPage * limit, totalItems)}
                    </span>
                    <span className="ml-1">of</span>
                    <span className="ml-1 font-semibold text-gray-900">
                      {totalItems}
                    </span>
                    <span className="ml-1">results</span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="h-10 px-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      aria-label="First page"
                    >
                      «
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="h-10 px-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="hidden sm:inline">Previous</span>
                    </button>
                    <div className="flex items-center gap-1">
                      {getPageNumbers(totalPages, currentPage, 5).map((p: number | string, idx: number) =>
                        typeof p === "number" ? (
                          <button
                            key={`page-${p}`}
                            onClick={() => setCurrentPage(p)}
                            className={`h-10 w-10 rounded-xl text-sm font-semibold transition-all ${
                              currentPage === p
                                ? "bg-primary-600 text-white shadow-sm"
                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                            aria-current={currentPage === p ? "page" : undefined}
                          >
                            {p}
                          </button>
                        ) : (
                          <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">…</span>
                        )
                      )}
                    </div>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="h-10 px-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="h-10 px-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      aria-label="Last page"
                    >
                      »
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget && !deleting) {
                setShowDeleteModal(null);
              }
            }}
          >
            <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-auto shadow-2xl border border-gray-100 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-red-600">
                  Delete User
                </h2>
                <button
                  onClick={() => {
                    if (!deleting) {
                      setShowDeleteModal(null);
                    }
                  }}
                  disabled={deleting !== null}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold">
                      Delete {showDeleteModal.name}?
                    </p>
                    <p className="text-gray-600 text-sm">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-800 text-sm">
                    Are you sure you want to permanently delete{" "}
                    <strong>{showDeleteModal.name}</strong> (
                    {showDeleteModal.email})? This will remove all user data and
                    cannot be reversed.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleDeleteUser(showDeleteModal)}
                  disabled={deleting !== null}
                  className="btn btn-danger flex-1"
                >
                  {deleting === showDeleteModal.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </div>
                  ) : (
                    "Delete User"
                  )}
                </button>
                <button
                  onClick={() => {
                    if (!deleting) {
                      setShowDeleteModal(null);
                    }
                  }}
                  disabled={deleting !== null}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Role Change Modal */}
        {showRoleModal && (
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget && !updatingRole) {
                setShowRoleModal(null);
              }
            }}
          >
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl mx-auto shadow-2xl border border-gray-100 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Change User Role
                </h2>
                <button
                  onClick={() => {
                    if (!updatingRole) {
                      setShowRoleModal(null);
                    }
                  }}
                  disabled={updatingRole !== null}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-semibold text-primary-600">
                      {showRoleModal.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold text-lg">
                      {showRoleModal.name}
                    </p>
                    <p className="text-gray-600">{showRoleModal.email}</p>
                    <p className="text-sm text-gray-500">
                      Current role:{" "}
                      <span className="font-medium">
                        {getRoleLabel(showRoleModal.role)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleChangeRole(showRoleModal, "admin")}
                    disabled={
                      updatingRole !== null || showRoleModal.role === "admin"
                    }
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      showRoleModal.role === "admin"
                        ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-red-200 hover:border-red-300 hover:bg-red-50 cursor-pointer"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-4 h-4 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            Administrator
                          </div>
                          <div className="text-sm text-gray-600">
                            Full system access and management
                          </div>
                        </div>
                      </div>
                      {updatingRole === showRoleModal.id && (
                        <svg
                          className="w-5 h-5 animate-spin text-primary-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => handleChangeRole(showRoleModal, "dosen")}
                    disabled={
                      updatingRole !== null || showRoleModal.role === "dosen"
                    }
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      showRoleModal.role === "dosen"
                        ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-blue-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-4 h-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            Dosen
                          </div>
                          <div className="text-sm text-gray-600">
                            Teacher access with course management
                          </div>
                        </div>
                      </div>
                      {updatingRole === showRoleModal.id && (
                        <svg
                          className="w-5 h-5 animate-spin text-primary-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => handleChangeRole(showRoleModal, "mahasiswa")}
                    disabled={
                      updatingRole !== null ||
                      showRoleModal.role === "mahasiswa"
                    }
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      showRoleModal.role === "mahasiswa"
                        ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-green-200 hover:border-green-300 hover:bg-green-50 cursor-pointer"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            Mahasiswa
                          </div>
                          <div className="text-sm text-gray-600">
                            Student access with limited permissions
                          </div>
                        </div>
                      </div>
                      {updatingRole === showRoleModal.id && (
                        <svg
                          className="w-5 h-5 animate-spin text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (!updatingRole) {
                      setShowRoleModal(null);
                    }
                  }}
                  disabled={updatingRole !== null}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
