import { useState, useEffect, useCallback, useMemo } from "react";
import PageHeader from "../components/PageHeader";
import Section from "../components/Section";
import type { Order } from "../lib/api";
import { safeReplace } from "../utils/safeAccess";

const OrdersPage = () => {
  // Dummy data for testing (memoized to keep stable reference)
  const dummyOrders: Order[] = useMemo(() => [
    {
      id: 1,
      order_number: 202401001,
      user_id: 1,
      kelas_id: 1,
      payment_reference: "PAY-123456789",
      gross_amount: 500000,
      status: "pending",
      payment_type: "bank_transfer",
      transaction_id: "TXN-123456",
      snap_token: "snap_token_123",
      snap_redirect_url:
        "https://app.midtrans.com/snap/v1/transactions/snap_token_123/redirect",
      created_at: "2024-08-01T10:00:00.000Z",
      updated_at: "2024-08-01T10:00:00.000Z",
      user: {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "student",
        phone_number: "081234567890",
        date_of_birth: "1995-01-01",
        gender: "male",
        city: "Jakarta",
        created_at: "2024-07-01T10:00:00.000Z",
        updated_at: "2024-07-01T10:00:00.000Z",
        updated_by: 1,
      },
      kelas: {
        id: 1,
        name: "Kelas CPNS 2024",
        description: "Persiapan ujian CPNS tahun 2024",
        price: 500000,
      },
    },
    {
      id: 2,
      order_number: 202401002,
      user_id: 2,
      kelas_id: 1,
      payment_reference: "PAY-987654321",
      gross_amount: 500000,
      status: "paid",
      payment_type: "credit_card",
      transaction_id: "TXN-987654",
      snap_token: "snap_token_456",
      snap_redirect_url:
        "https://app.midtrans.com/snap/v1/transactions/snap_token_456/redirect",
      created_at: "2024-08-02T14:30:00.000Z",
      updated_at: "2024-08-02T15:00:00.000Z",
      user: {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        role: "student",
        phone_number: "081234567891",
        date_of_birth: "1992-05-15",
        gender: "female",
        city: "Bandung",
        created_at: "2024-07-02T10:00:00.000Z",
        updated_at: "2024-07-02T10:00:00.000Z",
        updated_by: 1,
      },
      kelas: {
        id: 1,
        name: "Kelas CPNS 2024",
        description: "Persiapan ujian CPNS tahun 2024",
        price: 500000,
      },
    },
  ], []);

  const [orders, setOrders] = useState<Order[]>(dummyOrders);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(2);
  // Standardized items per page (kept constant untuk konsistensi antar halaman)
  const ITEMS_PER_PAGE = 10;
  // Filter: search only
  const [search, setSearch] = useState("");
  // Sorting controls
  const [sortKey, setSortKey] = useState<"date" | "status">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const loadOrders = useCallback(async (
    page: number = currentPage
  ) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading orders with page:", page, "limit:", ITEMS_PER_PAGE);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For now, use dummy data
      setOrders(dummyOrders);
      setTotalItems(dummyOrders.length);
      setTotalPages(1);
      setCurrentPage(1);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, dummyOrders]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadOrders(page);
  };

  // Derived: filtered & paginated orders
  const filteredOrders = useMemo(() => {
    const normalize = (v?: string | number | null) => (v ? String(v).toLowerCase() : "");
    return orders.filter((o) => {
      const q = search.trim().toLowerCase();
      return !q
        || normalize(o.order_number).includes(q)
        || normalize(o.payment_reference).includes(q)
        || normalize(o.user?.name).includes(q)
        || normalize(o.user?.email).includes(q)
        || normalize(o.kelas?.name).includes(q)
        || normalize(o.payment_type).includes(q)
        || normalize(o.status).includes(q);
    });
  }, [orders, search]);

  const sortedOrders = useMemo(() => {
    const arr = [...filteredOrders];
    arr.sort((a, b) => {
      if (sortKey === "date") {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return sortDir === "asc" ? da - db : db - da;
      }
      const sa = (a.status || "").toLowerCase();
      const sb = (b.status || "").toLowerCase();
      if (sa < sb) return sortDir === "asc" ? -1 : 1;
      if (sa > sb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filteredOrders, sortKey, sortDir]);

  const paginatedOrders = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedOrders.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [sortedOrders, currentPage]);

  // Keep total items/pages in sync with filters
  useEffect(() => {
    const total = filteredOrders.length;
    setTotalItems(total);
    const pages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
    setTotalPages(pages);
    if (currentPage > pages) setCurrentPage(pages);
  }, [filteredOrders]);

  // Pagination helper untuk tampilan angka halaman yang ringkas
  const getPageNumbers = (
    current: number,
    total: number,
    maxLength = 7
  ): (number | string)[] => {
    if (total <= maxLength) return Array.from({ length: total }, (_, i) => i + 1);
    const sideWidth = 1;
    const leftWidth = Math.max(0, maxLength - sideWidth * 2 - 3);
    const rightWidth = leftWidth;
    if (current <= maxLength - sideWidth - 1 - rightWidth) {
      return [
        ...Array.from({ length: maxLength - sideWidth - 1 }, (_, i) => i + 1),
        "…",
        total,
      ];
    }
    if (current >= total - sideWidth - 1 - rightWidth) {
      return [
        1,
        "…",
        ...Array.from(
          { length: maxLength - sideWidth - 1 },
          (_, i) => total - (maxLength - sideWidth - 2) + i
        ),
      ];
    }
    return [
      1,
      "…",
      ...Array.from(
        { length: leftWidth + rightWidth + 1 },
        (_, i) => current - leftWidth + i
      ),
      "…",
      total,
    ];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
      expired: "bg-orange-100 text-orange-800",
    };

    const className =
      statusClasses[status as keyof typeof statusClasses] ||
      "bg-gray-100 text-gray-800";

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading orders...</span>
      </div>
    );
  }

  // New: count successful orders (respect filters)
  const totalPaidOrders = filteredOrders.filter(
    (order) => order.status === "paid"
  ).length;
  const totalPaidAmount = filteredOrders
    .filter((order) => order.status === "paid" && order.gross_amount)
    .reduce((sum, order) => sum + (order.gross_amount || 0), 0);
  // New: count pending and expired orders (respect filters)
  const totalPendingOrders = filteredOrders.filter(
    (order) => order.status === "pending"
  ).length;
  const totalExpiredOrders = filteredOrders.filter(
    (order) => order.status === "expired"
  ).length;

  return (
    <div className="p-6">
      <PageHeader
        title="Manajemen Orders"
        description="Kelola semua pesanan dan transaksi pengguna"
      />
      <Section>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
        )}

        {/* Stats (modern, single-row on lg) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
          {/* Total Orders (small) */}
          <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-all lg:col-span-2">
            <div className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18"/></svg>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-500">Total Orders</span>
              </div>
              <div className="mt-2 text-xl font-bold text-gray-900">{totalItems}</div>
            </div>
          </div>
          {/* Order Pending (small) */}
          <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-all lg:col-span-2">
            <div className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-500">Order Pending</span>
              </div>
              <div className="mt-2 text-xl font-bold text-yellow-600">{totalPendingOrders}</div>
            </div>
          </div>
          {/* Order Sukses (small) */}
          <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-all lg:col-span-2">
            <div className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-500">Order Sukses</span>
              </div>
              <div className="mt-2 text-xl font-bold text-green-600">{totalPaidOrders}</div>
            </div>
          </div>
          {/* Order Expired (small) */}
          <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-all lg:col-span-2">
            <div className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-500">Order Expired</span>
              </div>
              <div className="mt-2 text-xl font-bold text-orange-600">{totalExpiredOrders}</div>
            </div>
          </div>
          {/* Total Pendapatan (1/3 width) */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl h-full border border-gray-100 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2"/></svg>
                  </div>
                  <span className="text-sm font-medium text-gray-500">Total Pendapatan</span>
                </div>
                <div className="mt-3 block text-right font-bold text-purple-700 truncate whitespace-nowrap text-xl tabular-nums" title={formatCurrency(totalPaidAmount)}>
                  {formatCurrency(totalPaidAmount)}
                </div>
              </div>
            </div>
          </div>
        </div>

        

        {/* Orders Table + Pagination in one card (search included) */}
        <div className="card overflow-hidden">
          <div className="card-body p-0">
            {/* Search bar inside table card to match PaketUjianPage */}
            <label className="block text-sm font-medium text-gray-700 mb-2">Cari Orders</label>
            <div className="relative mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Cari berdasarkan nomor order, customer, kelas, pembayaran, status..."
                aria-label="Cari orders"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="border-t" />
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order Info</th>
                    <th className="hidden md:table-cell">Customer</th>
                    <th className="hidden lg:table-cell">Kelas</th>
                    <th className="hidden lg:table-cell">Payment</th>
                    <th>
                      <button
                        type="button"
                        onClick={() => {
                          if (sortKey === "status") {
                            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                          } else {
                            setSortKey("status");
                            setSortDir("asc");
                          }
                          setCurrentPage(1);
                        }}
                        className={`inline-flex items-center gap-1 hover:text-primary-600 ${sortKey === "status" ? "text-primary-700" : "text-gray-700"}`}
                        aria-label="Sort by status"
                      >
                        <span>Status</span>
                        {/* Icon */}
                        {sortKey === "status" ? (
                          sortDir === "asc" ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          )
                        ) : (
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11h10M5 7h14M9 15h6" />
                          </svg>
                        )}
                      </button>
                    </th>
                    <th className="hidden md:table-cell">
                      <button
                        type="button"
                        onClick={() => {
                          if (sortKey === "date") {
                            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                          } else {
                            setSortKey("date");
                            setSortDir("desc");
                          }
                          setCurrentPage(1);
                        }}
                        className={`inline-flex items-center gap-1 hover:text-primary-600 ${sortKey === "date" ? "text-primary-700" : "text-gray-700"}`}
                        aria-label="Sort by date"
                      >
                        <span>Date</span>
                        {sortKey === "date" ? (
                          sortDir === "asc" ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          )
                        ) : (
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11h10M5 7h14M9 15h6" />
                          </svg>
                        )}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="text-center py-12 text-gray-500">
                          <div className="text-4xl mb-2">📦</div>
                          <div className="text-lg font-medium">Tidak ada orders</div>
                          <div className="text-sm">Belum ada pesanan yang ditemukan</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td>
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">#{order.order_number || "N/A"}</div>
                            <div className="text-sm text-gray-500">ID: {order.id || "N/A"}</div>
                            <div className="text-xs text-gray-400">{order.payment_reference || "N/A"}</div>
                            {/* Mobile extra info */}
                            <div className="mt-1 text-xs text-gray-600 md:hidden">
                              {order.gross_amount ? formatCurrency(order.gross_amount) : "N/A"} • {safeReplace(order.payment_type || "-", "_", " ")}
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">{order.user?.name || "N/A"}</div>
                            <div className="text-sm text-gray-500">{order.user?.email || "N/A"}</div>
                            <div className="text-xs text-gray-400">{order.user?.phone_number || "N/A"}</div>
                          </div>
                        </td>
                        <td className="hidden lg:table-cell">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">{order.kelas?.name || "N/A"}</div>
                            <div className="text-sm text-gray-500">{order.kelas?.price ? formatCurrency(order.kelas.price) : "N/A"}</div>
                          </div>
                        </td>
                        <td className="hidden lg:table-cell">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">{order.gross_amount ? formatCurrency(order.gross_amount) : "N/A"}</div>
                            <div className="text-sm text-gray-500">{safeReplace(order.payment_type || "-", "_", " ")}</div>
                          </div>
                        </td>
                        <td>{getStatusBadge(order.status || "unknown")}</td>
                        <td className="hidden md:table-cell">
                          <div className="text-sm text-gray-900">
                            {order.created_at ? formatDate(order.created_at) : "N/A"}
                          </div>
                          {order.updated_at && order.created_at && order.updated_at !== order.created_at && (
                            <div className="text-xs text-gray-500">Updated: {formatDate(order.updated_at)}</div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="card-footer">
              <div className="flex items-center justify-between flex-col gap-3 sm:flex-row">
                <div className="text-sm text-gray-700">
                  Halaman <span className="font-medium">{currentPage}</span> dari <span className="font-medium">{totalPages}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="btn btn-secondary"
                    aria-label="First page"
                  >
                    «
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-secondary"
                    aria-label="Previous page"
                  >
                    Prev
                  </button>
                  {getPageNumbers(currentPage, totalPages).map((p, idx) => (
                    <button
                      key={`${p}-${idx}`}
                      onClick={() => typeof p === "number" && handlePageChange(p)}
                      disabled={p === "…"}
                      className={`btn btn-secondary ${p === currentPage ? "!bg-primary-600 !text-white border-primary-600" : ""}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="btn btn-secondary"
                    aria-label="Next page"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="btn btn-secondary"
                    aria-label="Last page"
                  >
                    »
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
};

export default OrdersPage;
