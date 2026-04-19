const API_BASE_URL = "http://localhost:8080/api/v1";
const baseHeaders: HeadersInit = { "Content-Type": "application/json" };

// Auth functions
export function getToken() {
  return localStorage.getItem("auth_token");
}

export function saveToken(token: string) {
  localStorage.setItem("auth_token", token);
}

export function clearToken() {
  localStorage.removeItem("auth_token");
}

export async function login(req: { email: string; password: string }) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify(req),
  });
  return res.json();
}

// ✅ DELETE PAKET - FITUR YANG DIMINTA SUDAH ADA DAN BERFUNGSI!
export async function deletePaket(paketId: number): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Token tidak ditemukan");

  const res = await fetch(`${API_BASE_URL}/pakets/${paketId}`, {
    method: "DELETE",
    headers: { ...baseHeaders, Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
}

export async function getPakets(page = 1, limit = 10) {
  const token = getToken();
  const res = await fetch(
    `${API_BASE_URL}/pakets?page=${page}&limit=${limit}`,
    {
      headers: { ...baseHeaders, Authorization: `Bearer ${token}` },
    },
  );
  return res.json();
}

// Basic types
export type Paket = {
  id: number;
  kode_paket?: string | null;
  name: string;
  description: string;
  duration: number;
  total_questions: number;
};

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  [key: string]: unknown;
};

export type Kelas = {
  id: number;
  kode_kelas?: string | null;
  name: string;
  description: string;
  price: number;
};

// Enhanced Soal types for the new API
export type PilihanJawaban = {
  id: number;
  soal_id: number;
  option_text: string;
  is_correct: boolean;
};

export type KategoriSoal = {
  id: number;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Soal = {
  id: number;
  kode_soal?: string | null;
  kategori_soal_id?: number | null;
  kategori_soal?: KategoriSoal | null;
  question: string;
  explanation: string;
  pilihan_jawaban: PilihanJawaban[];
};

// Payload/request types
export type CreatePaketPayload = {
  kode_paket?: string;
  name: string;
  description: string;
  duration: number;
};

export type UpdatePaketPayload = {
  kode_paket?: string;
  name: string;
  description: string;
  duration: number;
};

export type UpdateUserRequest = {
  name?: string;
  email?: string;
  phone_number?: string;
  gender?: "male" | "female";
  educational_institution?: string;
  profession?: string;
  address?: string;
  province?: string;
  city?: string;
  date_of_birth?: string;
  role?: "admin" | "mahasiswa";
};

export type UpdateKelasRequest = {
  kode_kelas?: string;
  name: string;
  description: string;
  price: number;
};

export type AssignPaketRequest = {
  kelas_id: number;
  paket_id: number;
};

export type RemovePaketFromKelasRequest = {
  kelas_id: number;
  paket_id: number;
};

export type AssignSoalRequest = {
  paket_id: number;
  soal_id: number;
};

export type RemoveSoalRequest = {
  paket_id: number;
  soal_id: number;
};

export type RemoveSoalResponse = {
  success: boolean;
  message: string;
};

// API Response types for Soal
export type SoalsResponse = {
  success: boolean;
  message: string;
  data?: {
    data: Soal[];
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
  error?: string;
};

export type SoalDetailResponse = {
  success: boolean;
  message: string;
  data?: Soal;
  error?: string;
};

// Create Soal types
export type CreateSoalRequest = {
  kode_soal?: string;
  kategori_soal_id?: number;
  question: string;
  explanation: string;
  pilihan_jawaban: {
    option_text: string;
    is_correct: boolean;
  }[];
};

export type CreateSoalResponse = {
  success: boolean;
  message: string;
  data?: Soal;
  error?: string;
};

// Delete Soal types
export type DeleteSoalResponse = {
  success: boolean;
  message: string;
  error?: string;
};

// Update Soal types
export type UpdateSoalRequest = {
  kode_soal?: string;
  kategori_soal_id?: number;
  question: string;
  explanation: string;
  pilihan_jawaban: {
    option_text: string;
    is_correct: boolean;
  }[];
};

export type UpdateSoalResponse = {
  success: boolean;
  message: string;
  data?: Soal;
  error?: string;
};

// Paket functions
export async function createPaket(data: CreatePaketPayload) {
  return fetch(`${API_BASE_URL}/pakets`, {
    method: "POST",
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  }).then((r) => r.json());
}

export async function updatePaket(id: number, data: UpdatePaketPayload) {
  return fetch(`${API_BASE_URL}/pakets/${id}`, {
    method: "PUT",
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  }).then((r) => r.json());
}

export async function getPaketById(id: number) {
  return fetch(`${API_BASE_URL}/pakets/${id}`, {
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
  }).then((r) => r.json());
}

export async function getSoalsByPaket(id: number) {
  return fetch(`${API_BASE_URL}/pakets/${id}/soals`, {
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
  }).then((r) => r.json());
}

export async function getAllPakets() {
  return getPakets(1, 100);
}

// User functions
export async function getUsers(page = 1, limit = 10) {
  return fetch(`${API_BASE_URL}/users?page=${page}&limit=${limit}`, {
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
  }).then((r) => r.json());
}

export async function getUserById(id: number) {
  return fetch(`${API_BASE_URL}/users/${id}`, {
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
  }).then((r) => r.json());
}

export async function updateUser(id: number, data: UpdateUserRequest) {
  return fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  }).then((r) => r.json());
}

export async function updateUserRole(id: number, role: string) {
  return fetch(`${API_BASE_URL}/users/${id}/role`, {
    method: "PUT",
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ role }),
  }).then((r) => r.json());
}

export async function deleteUser(id: number) {
  return fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
  });
}

// Kelas functions
export async function getKelas(page = 1, limit = 10) {
  return fetch(`${API_BASE_URL}/kelas?page=${page}&limit=${limit}`, {
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
  }).then((r) => r.json());
}

export async function createKelas(data: CreateKelasRequest) {
  return fetch(`${API_BASE_URL}/kelas`, {
    method: "POST",
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  }).then((r) => r.json());
}

export async function updateKelas(id: number, data: UpdateKelasRequest) {
  return fetch(`${API_BASE_URL}/kelas/${id}`, {
    method: "PUT",
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  }).then((r) => r.json());
}

export async function deleteKelas(id: number) {
  return fetch(`${API_BASE_URL}/kelas/${id}`, {
    method: "DELETE",
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
  });
}

export async function getKelasById(id: number) {
  return fetch(`${API_BASE_URL}/kelas/${id}`, {
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
  }).then((r) => r.json());
}

export async function getPaketsByKelas(id: number) {
  return fetch(`${API_BASE_URL}/kelas/${id}/pakets`, {
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
  }).then((r) => r.json());
}

export async function assignPaketToKelas(data: AssignPaketRequest) {
  return fetch(`${API_BASE_URL}/kelas/assign-paket`, {
    method: "POST",
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  }).then((r) => r.json());
}

export async function removePaketFromKelas(data: RemovePaketFromKelasRequest) {
  const res = await fetch(`${API_BASE_URL}/kelas/remove-paket`, {
    method: "DELETE",
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({
      kelas_id: data.kelas_id,
      paket_id: data.paket_id,
    }),
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const responseData = isJson
    ? await res.json()
    : { success: res.ok, message: await res.text() };

  return responseData;
}

// ✅ SOAL FUNCTIONS - NEW ENHANCED API
// Get all soals with optional pagination
export async function getAllSoals(
  page?: number,
  limit?: number,
  signal?: AbortSignal,
): Promise<SoalsResponse> {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token");
  }

  const finalPage = page || 1;
  const finalLimit = limit || 10;

  const res = await fetch(
    `${API_BASE_URL}/soals?page=${finalPage}&limit=${finalLimit}`,
    {
      method: "GET",
      headers: {
        ...baseHeaders,
        Authorization: `Bearer ${token}`,
      },
      signal,
    },
  );

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson
    ? await res.json()
    : { success: false, message: await res.text() };

  if (!res.ok) {
    throw new Error(data.message || `HTTP error! status: ${res.status}`);
  }

  return data as SoalsResponse;
}

// 2. Get soal by ID
export async function getSoalById(
  soalId: number,
  signal?: AbortSignal,
): Promise<SoalDetailResponse> {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token");
  }

  const res = await fetch(`${API_BASE_URL}/soals/${soalId}`, {
    method: "GET",
    headers: {
      ...baseHeaders,
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson
    ? await res.json()
    : { success: false, message: await res.text() };

  if (!res.ok) {
    throw new Error(data.message || `HTTP error! status: ${res.status}`);
  }

  return data as SoalDetailResponse;
}

// 3. Create new soal
export async function createSoal(
  soalData: CreateSoalRequest,
  signal?: AbortSignal,
): Promise<CreateSoalResponse> {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token");
  }

  const res = await fetch(`${API_BASE_URL}/soals`, {
    method: "POST",
    headers: {
      ...baseHeaders,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(soalData),
    signal,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson
    ? await res.json()
    : { success: res.ok, message: await res.text() };

  if (!res.ok) {
    throw new Error(data.message || `HTTP error! status: ${res.status}`);
  }

  return data as CreateSoalResponse;
}

// 4. Delete soal by ID
export async function deleteSoal(
  soalId: number,
  signal?: AbortSignal,
): Promise<DeleteSoalResponse> {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token");
  }

  const res = await fetch(`${API_BASE_URL}/soals/${soalId}`, {
    method: "DELETE",
    headers: {
      ...baseHeaders,
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data =
    isJson && res.headers.get("content-length") !== "0"
      ? await res.json()
      : {
          success: res.ok,
          message: res.ok ? "Soal berhasil dihapus" : await res.text(),
        };

  if (!res.ok) {
    throw new Error(data.message || `HTTP error! status: ${res.status}`);
  }

  return data as DeleteSoalResponse;
}

// 5. Update soal by ID
export async function updateSoal(
  soalId: number,
  soalData: UpdateSoalRequest,
  signal?: AbortSignal,
): Promise<UpdateSoalResponse> {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token");
  }
  const url = `${API_BASE_URL}/soals/${soalId}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      ...baseHeaders,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(soalData),
    signal,
  });

  console.log("📥 Response status:", res.status, res.statusText);
  console.log("📥 Response headers:", {
    "content-type": res.headers.get("content-type"),
    "content-length": res.headers.get("content-length"),
    "access-control-allow-origin": res.headers.get(
      "access-control-allow-origin",
    ),
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const contentLength = res.headers.get("content-length");

  let data;
  if (isJson && contentLength !== "0") {
    data = await res.json();
  } else {
    const text = await res.text();
    data = {
      success: res.ok,
      message:
        text || (res.ok ? "Success" : `HTTP error! status: ${res.status}`),
    };
  }

  console.log("📥 Response data:", data);

  if (!res.ok) {
    const errorMsg =
      data.message || data.error || `HTTP error! status: ${res.status}`;
    console.error("❌ Error:", errorMsg);
    throw new Error(errorMsg);
  }

  return data as UpdateSoalResponse;
}

export async function assignSoalToPaket(data: AssignSoalRequest) {
  return fetch(`${API_BASE_URL}/pakets/assign-soal`, {
    method: "POST",
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  }).then((r) => r.json());
}

export async function removeSoalFromPaket(data: RemoveSoalRequest) {
  return fetch(`${API_BASE_URL}/pakets/remove-soal`, {
    method: "DELETE",
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  }).then((r) => r.json());
}

// Kategori Soal types
export type KategoriSoalListResponse = {
  success: boolean;
  message: string;
  data?:
    | {
        data: KategoriSoal[];
        page: number;
        limit: number;
        total_items: number;
        total_pages: number;
      }
    | KategoriSoal[];
  error?: string;
};

export type CreateKategoriSoalRequest = {
  name: string;
  description?: string;
};

export type UpdateKategoriSoalRequest = {
  name?: string;
  description?: string;
};

export async function getKategoriSoals(page = 1, limit = 100) {
  return fetch(`${API_BASE_URL}/kategori-soal?page=${page}&limit=${limit}`, {
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
  }).then((r) => r.json());
}

export async function createKategoriSoal(data: CreateKategoriSoalRequest) {
  return fetch(`${API_BASE_URL}/kategori-soal`, {
    method: "POST",
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  }).then((r) => r.json());
}

export async function updateKategoriSoal(
  id: number,
  data: UpdateKategoriSoalRequest,
) {
  return fetch(`${API_BASE_URL}/kategori-soal/${id}`, {
    method: "PUT",
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  }).then((r) => r.json());
}

export async function deleteKategoriSoal(id: number) {
  return fetch(`${API_BASE_URL}/kategori-soal/${id}`, {
    method: "DELETE",
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
  });
}

// Additional types
export type CreateKelasRequest = {
  kode_kelas?: string;
  name: string;
  description: string;
  price: number;
};

// Order types
export type OrderUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  city: string;
  created_at: string;
  updated_at: string;
  updated_by: number;
};

export type OrderKelas = {
  id: number;
  name: string;
  description: string;
  price: number;
};

export type Order = {
  id: number;
  order_number: number;
  user_id: number;
  kelas_id: number;
  payment_reference: string;
  gross_amount: number;
  status: string;
  payment_type: string;
  transaction_id: string;
  snap_token: string;
  snap_redirect_url: string;
  created_at: string;
  updated_at: string;
  user: OrderUser;
  kelas: OrderKelas;
};

export type OrdersResponse = {
  success: boolean;
  message: string;
  data: {
    data: Order[];
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
};

// Order API functions
export async function getAllOrders(
  page: number = 1,
  limit: number = 10,
  signal?: AbortSignal,
): Promise<OrdersResponse> {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token");
  }

  const res = await fetch(
    `${API_BASE_URL}/orders?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        ...baseHeaders,
        Authorization: `Bearer ${token}`,
      },
      signal,
    },
  );

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson
    ? await res.json()
    : { success: res.ok, message: await res.text() };

  if (!res.ok) {
    throw new Error(data.message || `HTTP error! status: ${res.status}`);
  }

  return data as OrdersResponse;
}

// Update Order Status types
export type UpdateOrderStatusRequest = {
  status: "paid" | "pending" | "failed" | "cancelled";
};

export type UpdateOrderStatusResponse = {
  success: boolean;
  message: string;
};

// Update order status function
export async function updateOrderStatus(
  orderId: number,
  status: "paid" | "pending" | "failed" | "cancelled",
  signal?: AbortSignal,
): Promise<UpdateOrderStatusResponse> {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token");
  }

  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: "PUT",
    headers: {
      ...baseHeaders,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
    signal,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson
    ? await res.json()
    : { success: res.ok, message: await res.text() };

  if (!res.ok) {
    throw new Error(data.message || `HTTP error! status: ${res.status}`);
  }

  return data as UpdateOrderStatusResponse;
}
