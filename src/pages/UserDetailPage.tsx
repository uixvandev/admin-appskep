import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as api from "../lib/api";
import PageHeader from "../components/PageHeader.tsx";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Refine User shape locally to avoid 'unknown' fields from index signature
  type StrictUser = api.User & {
    phone_number?: string;
    gender?: "male" | "female" | string;
    educational_institution?: string;
    profession?: string;
    address?: string;
    province?: string;
    city?: string;
    date_of_birth?: string;
    created_at: string;
    updated_at: string;
    updated_by?: number;
  };

  const [user, setUser] = useState<StrictUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"admin" | "mahasiswa">(
    "mahasiswa",
  );
  const [editFormData, setEditFormData] = useState<Partial<StrictUser>>({});

  // Role mapping function
  const mapRoleFromAPI = (apiRole: string): "admin" | "mahasiswa" => {
    if (apiRole.toLowerCase() === "admin") return "admin";
    return "mahasiswa";
  };

  const loadUser = useCallback(async (userId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getUserById(userId);
      if (response.success && response.data) {
        const u = response.data as StrictUser;
        setUser(u);
        setSelectedRole(mapRoleFromAPI(u.role));
      } else {
        setError(response.error || "Failed to load user details");
      }
    } catch (error) {
      const err = error as Error;
      console.error("Error loading user:", err);

      if (err.message?.includes("authentication")) {
        api.clearToken();
        window.location.href = "/";
      } else {
        setError(err.message || "Network error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadUser(parseInt(id));
    }
  }, [id, loadUser]);

  async function handleRoleUpdate() {
    if (!user || !selectedRole || mapRoleFromAPI(user.role) === selectedRole)
      return;

    setUpdating(true);
    try {
      await api.updateUserRole(user.id, selectedRole);
      // Success - update user state with the new role
      setUser((prev) =>
        prev
          ? { ...prev, role: selectedRole === "admin" ? "admin" : "mahasiswa" }
          : null,
      );
      setShowRoleModal(false);
    } catch (error) {
      console.error("Error updating user role:", error);
      alert(
        error instanceof Error
          ? error.message
          : "An error occurred while updating the user role",
      );
    } finally {
      setUpdating(false);
    }
  }

  const handleDeleteUser = async () => {
    if (!user) return;

    setDeleting(true);
    try {
      await api.deleteUser(user.id);
      // Success - navigate back to users page
      navigate("/users");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(
        error instanceof Error
          ? error.message
          : "An error occurred while deleting the user",
      );
    } finally {
      setDeleting(false);
    }
  };

  async function handleUpdateUser() {
    if (!user) return;

    setUpdating(true);
    try {
      const response = await api.updateUser(user.id, {
        name: editFormData.name,
        email: editFormData.email,
        phone_number: editFormData.phone_number,
        gender: editFormData.gender as "male" | "female" | undefined,
        educational_institution: editFormData.educational_institution,
        profession: editFormData.profession,
        address: editFormData.address,
        province: editFormData.province,
        city: editFormData.city,
        date_of_birth: editFormData.date_of_birth,
        role: editFormData.role as "admin" | "mahasiswa" | undefined,
      });
      if (response.success && response.data) {
        setUser(response.data);
        setShowEditModal(false);
      } else {
        alert(response.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert(
        error instanceof Error
          ? error.message
          : "An error occurred while updating the user",
      );
    } finally {
      setUpdating(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function formatDateTime(dateString: string) {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getRoleColor(role: string) {
    switch (role) {
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "mahasiswa":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 text-red-500">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Error Loading User
        </h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => id && loadUser(parseInt(id))}
            className="text-white rounded-lg px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#00A1F5" }}
          >
            Try Again
          </button>
          <a
            href="/users"
            className="bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            Back to Users
          </a>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          User Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The requested user could not be found.
        </p>
        <a
          href="/users"
          className="text-white rounded-lg px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity inline-block"
          style={{ backgroundColor: "#00A1F5" }}
        >
          Back to Users
        </a>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate("/users")}
          className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
        >
          <svg
            className="w-6 h-6"
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
        </button>
      </div>
      <PageHeader
        title="Detail Pengguna"
        description={`ID Pengguna #${user.id}`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setSelectedRole(mapRoleFromAPI(user.role));
                setShowRoleModal(true);
              }}
              className="btn btn-secondary"
            >
              Ubah Role
            </button>
            <button
              onClick={() => {
                setEditFormData(user);
                setShowEditModal(true);
              }}
              className="btn btn-secondary"
            >
              Ubah Pengguna
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-danger"
            >
              Hapus Pengguna
            </button>
          </div>
        }
      />

      {/* User Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2 card">
          <div className="card-body">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Informasi Dasar
            </h3>
            <div className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0 ring-4 ring-white">
                  <span className="text-primary-600 text-3xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">
                    {user.name}
                  </h4>
                  <span
                    className={`inline-flex mt-2 px-3 py-1.5 text-xs font-semibold rounded-full ${getRoleColor(
                      user.role,
                    )}`}
                  >
                    {user.role === "admin" ? "Administrator" : "Mahasiswa"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900 break-all">
                      {user.email}
                    </p>
                  </div>
                </div>

                {user.phone_number && (
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Nomor Telepon</p>
                      <p className="font-semibold text-gray-900">
                        {user.phone_number}
                      </p>
                    </div>
                  </div>
                )}

                {user.date_of_birth && (
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Lahir</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(user.date_of_birth)}
                      </p>
                    </div>
                  </div>
                )}

                {user.gender && (
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Jenis Kelamin</p>
                      <p className="font-semibold text-gray-900 capitalize">
                        {user.gender}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="lg:col-span-1 card">
          <div className="card-body">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Informasi Sistem
            </h3>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">Dibuat Pada</p>
                  <p className="font-semibold text-gray-900">
                    {formatDateTime(user.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">Terakhir Diperbarui</p>
                  <p className="font-semibold text-gray-900">
                    {formatDateTime(user.updated_at)}
                  </p>
                </div>
              </div>
              {user.updated_by && (
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Diperbarui Oleh</p>
                    <p className="font-semibold text-gray-900">
                      Admin ID #{user.updated_by}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* More Details */}
      <div className="mt-6 card">
        <div className="card-body">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Detail Lainnya
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
            {user.city && (
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">Kota</p>
                  <p className="font-semibold text-gray-900">{user.city}</p>
                </div>
              </div>
            )}

            {user.province && (
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m-6 3l6-3"
                  />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">Provinsi</p>
                  <p className="font-semibold text-gray-900">{user.province}</p>
                </div>
              </div>
            )}

            {user.educational_institution && (
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                  />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">Institusi Pendidikan</p>
                  <p className="font-semibold text-gray-900">
                    {user.educational_institution}
                  </p>
                </div>
              </div>
            )}

            {user.profession && (
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v6.172a2 2 0 002 2.001h-12a2 2 0 002-2v-6.172m8 0V12a4 4 0 11-8 0V6"
                  />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">Profesi</p>
                  <p className="font-semibold text-gray-900">
                    {user.profession}
                  </p>
                </div>
              </div>
            )}

            {user.address && (
              <div className="flex items-start gap-3 col-span-full">
                <svg
                  className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">Alamat</p>
                  <p className="font-semibold text-gray-900">{user.address}</p>
                </div>
              </div>
            )}

            {/* If no additional info */}
            {!user.city &&
              !user.province &&
              !user.educational_institution &&
              !user.profession &&
              !user.address && (
                <div className="text-center py-8 col-span-full">
                  <p className="text-gray-500 text-sm">
                    Tidak ada informasi tambahan untuk pengguna ini.
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
      {/* Edit User Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !updating) {
              setShowEditModal(false);
            }
          }}
        >
          <div className="card w-full max-w-2xl mx-auto">
            <div className="card-body">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Ubah Pengguna
                </h2>
                <button
                  onClick={() => {
                    if (!updating) setShowEditModal(false);
                  }}
                  disabled={updating}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-h-[60vh] overflow-y-auto p-1">
                <div>
                  <label htmlFor="name" className="label">
                    Nama
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={editFormData.name || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="input w-full"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={editFormData.email || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                    className="input w-full"
                  />
                </div>
                <div>
                  <label htmlFor="phone_number" className="label">
                    Nomor Telepon
                  </label>
                  <input
                    type="text"
                    id="phone_number"
                    value={editFormData.phone_number || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phone_number: e.target.value,
                      })
                    }
                    className="input w-full"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="label">
                    Jenis Kelamin
                  </label>
                  <select
                    id="gender"
                    value={editFormData.gender || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        gender: e.target.value,
                      })
                    }
                    className="input w-full"
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="date_of_birth" className="label">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    id="date_of_birth"
                    value={
                      editFormData.date_of_birth
                        ? new Date(editFormData.date_of_birth)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        date_of_birth: e.target.value,
                      })
                    }
                    className="input w-full"
                  />
                </div>
                <div>
                  <label htmlFor="educational_institution" className="label">
                    Institusi Pendidikan
                  </label>
                  <input
                    type="text"
                    id="educational_institution"
                    value={editFormData.educational_institution || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        educational_institution: e.target.value,
                      })
                    }
                    className="input w-full"
                  />
                </div>
                <div>
                  <label htmlFor="profession" className="label">
                    Profesi
                  </label>
                  <input
                    type="text"
                    id="profession"
                    value={editFormData.profession || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        profession: e.target.value,
                      })
                    }
                    className="input w-full"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="label">
                    Alamat
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={editFormData.address || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        address: e.target.value,
                      })
                    }
                    className="input w-full"
                  />
                </div>
                <div>
                  <label htmlFor="province" className="label">
                    Provinsi
                  </label>
                  <input
                    type="text"
                    id="province"
                    value={editFormData.province || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        province: e.target.value,
                      })
                    }
                    className="input w-full"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="label">
                    Kota
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={editFormData.city || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, city: e.target.value })
                    }
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleUpdateUser}
                  disabled={updating}
                  className="btn btn-primary flex-1"
                >
                  {updating ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                  }}
                  disabled={updating}
                  className="btn btn-secondary flex-1"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Update Modal */}
      {showRoleModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !updating) {
              setShowRoleModal(false);
              setSelectedRole(mapRoleFromAPI(user.role));
            }
          }}
        >
          <div className="card w-full max-w-md mx-auto">
            <div className="card-body">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Ubah Role
                </h2>
                <button
                  onClick={() => {
                    if (!updating) setShowRoleModal(false);
                  }}
                  disabled={updating}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
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
                <p className="text-gray-600 text-sm mb-4">
                  Pilih role baru untuk pengguna ini. Perubahan akan langsung
                  diterapkan.
                </p>

                <div className="space-y-3">
                  <label
                    htmlFor="admin-role"
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedRole === "admin"
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      id="admin-role"
                      name="role"
                      value="admin"
                      checked={selectedRole === "admin"}
                      onChange={(e) =>
                        setSelectedRole(e.target.value as "admin" | "mahasiswa")
                      }
                      disabled={updating}
                      className="form-radio"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Admin</div>
                      <div className="text-sm text-gray-600">
                        Akses penuh ke sistem.
                      </div>
                    </div>
                  </label>

                  <label
                    htmlFor="mahasiswa-role"
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedRole === "mahasiswa"
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      id="mahasiswa-role"
                      name="role"
                      value="mahasiswa"
                      checked={selectedRole === "mahasiswa"}
                      onChange={(e) =>
                        setSelectedRole(e.target.value as "admin" | "mahasiswa")
                      }
                      disabled={updating}
                      className="form-radio"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        Mahasiswa
                      </div>
                      <div className="text-sm text-gray-600">
                        Akses terbatas sebagai peserta.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleRoleUpdate}
                  disabled={
                    updating || mapRoleFromAPI(user.role) === selectedRole
                  }
                  className="btn btn-primary flex-1"
                >
                  {updating ? "Memperbarui..." : "Update Role"}
                </button>
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedRole(mapRoleFromAPI(user.role));
                  }}
                  disabled={updating}
                  className="btn btn-secondary flex-1"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleting) {
              setShowDeleteModal(false);
            }
          }}
        >
          <div className="card w-full max-w-md mx-auto">
            <div className="card-body">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-red-600">
                  Hapus Pengguna
                </h2>
                <button
                  onClick={() => {
                    if (!deleting) setShowDeleteModal(false);
                  }}
                  disabled={deleting}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
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
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">
                    Apakah Anda yakin ingin menghapus{" "}
                    <strong>{user.name}</strong> ({user.email}) secara permanen?
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="btn btn-danger flex-1"
                >
                  {deleting ? "Menghapus..." : "Ya, Hapus Pengguna"}
                </button>
                <button
                  onClick={() => {
                    if (!deleting) setShowDeleteModal(false);
                  }}
                  disabled={deleting}
                  className="btn btn-secondary flex-1"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
