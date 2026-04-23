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

// Paket deactivate (soft delete: is_active = 0)
export async function deletePaket(packageCode: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Token tidak ditemukan");

  const url = `${API_BASE_URL}/pakets/${packageCode}`;

  console.group("🔍 [API] deletePaket request");
  console.log("URL:", url);
  console.log("Method:", "DELETE");
  console.log("Headers:", {
    Authorization: `Bearer ${token.slice(0, 12)}...`,
  });
  console.groupEnd();

  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  let responseBody: unknown;
  if (isJson) {
    responseBody = await res.json().catch(() => ({
      success: false,
      message: "Invalid JSON response",
    }));
  } else {
    responseBody = await res.text();
  }

  console.group("📥 [API] deletePaket response");
  console.log("Status:", res.status, res.statusText);
  console.log("Content-Type:", contentType || "(empty)");
  console.log("Response body (full):", responseBody);
  if (typeof responseBody === "object" && responseBody !== null) {
    console.log("Response body JSON:", JSON.stringify(responseBody, null, 2));
  }
  console.groupEnd();

  if (!res.ok) {
    const message =
      typeof responseBody === "string"
        ? responseBody
        : (responseBody as { message?: string; error?: string })?.message ||
          (responseBody as { message?: string; error?: string })?.error ||
          `HTTP error! status: ${res.status}`;
    throw new Error(message);
  }
}

export async function getPakets(page = 1, limit = 10) {
  const token = getToken();
  const res = await fetch(
    `${API_BASE_URL}/pakets?page=${page}&limit=${limit}&show_all=true`,
    {
      headers: { ...baseHeaders, Authorization: `Bearer ${token}` },
    },
  );
  return res.json();
}



// Basic types
export type Paket = {
  package_code: string;
  name: string;
  description: string;
  duration: number;
  total_questions: number;
  is_active?: number;
  id?: number;
  kode_paket?: string | null;
};

export type User = {
  name: string;
  email: string;
  role: "student" | "admin" | string;
  id?: number;
  [key: string]: unknown;
};

export type Kelas = {
  class_code: string;
  name: string;
  description: string;
  price: number;
  is_active?: number;
  id?: number;
  kode_kelas?: string | null;
};

// Enhanced Soal types for the new API
export type PilihanJawaban = {
  id: number;
  option_text: string;
  is_correct: boolean;
  soal_id?: number;
};

export type KategoriSoal = {
  category_name: string;
  name?: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  id?: number;
};

export type Soal = {
  question_code: string;
  category_name?: string | null;
  kategori_soal?: KategoriSoal | null;
  question: string;
  explanation: string;
  pilihan_jawaban: PilihanJawaban[];
  is_active?: number;
  id?: number;
  kode_soal?: string | null;
  kategori_soal_id?: number | null;
};

// Payload/request types
export type CreatePaketPayload = {
  package_code: string;
  name: string;
  description: string;
  duration: number;
};

export type UpdatePaketPayload = {
  package_code: string;
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
  role?: "admin" | "student";
};

export type UpdateKelasRequest = {
  class_code: string;
  name: string;
  description: string;
  price: number;
  is_active?: number;
};

export type AssignPaketRequest = {
  class_code: string;
  package_code: string;
};

export type RemovePaketFromKelasRequest = {
  class_code: string;
  package_code: string;
};

export type AssignSoalRequest = {
  package_code: string;
  question_code: string;
};

export type RemoveSoalRequest = {
  package_code: string;
  question_code: string;
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
  question_code: string;
  category_name: string;
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
  question_code: string;
  category_name: string;
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

export async function updatePaket(
  packageCode: string,
  data: UpdatePaketPayload,
) {
  return fetch(`${API_BASE_URL}/pakets/${packageCode}`, {
    method: "PUT",
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  }).then((r) => r.json());
}

export async function getPaketById(packageCode: string) {
  return fetch(`${API_BASE_URL}/pakets/${packageCode}`, {
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
  }).then((r) => r.json());
}

export async function getSoalsByPaket(packageCode: string) {
  return fetch(`${API_BASE_URL}/pakets/${packageCode}/soals`, {
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

export async function getUserById(email: string) {
  const encodedEmail = encodeURIComponent(email);
  return fetch(`${API_BASE_URL}/users/${encodedEmail}`, {
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
  }).then((r) => r.json());
}

export async function updateUser(_email: string, data: UpdateUserRequest) {
  const token = getToken();
  const requestBody = JSON.stringify(data);
  const url = `${API_BASE_URL}/users/profile`;

  console.group("🔍 [API] updateUser request");
  console.log("URL:", url);
  console.log("Method:", "PUT");
  console.log("Headers:", {
    ...baseHeaders,
    Authorization: token ? `Bearer ${token.slice(0, 12)}...` : null,
  });
  console.log("Raw payload object:", data);
  console.log("JSON payload:", requestBody);
  console.groupEnd();

  const response = await fetch(url, {
    method: "PUT",
    headers: { ...baseHeaders, Authorization: `Bearer ${token}` },
    body: requestBody,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const responseBody = isJson ? await response.json() : await response.text();

  console.group("📥 [API] updateUser response");
  console.log("Status:", response.status, response.statusText);
  console.log("Content-Type:", contentType || "(empty)");
  console.log("Response body (full):", responseBody);
  if (typeof responseBody === "object" && responseBody !== null) {
    console.log("Response body JSON:", JSON.stringify(responseBody, null, 2));
  }
  console.groupEnd();

  if (!response.ok) {
    const serverMessage =
      typeof responseBody === "string"
        ? responseBody
        : responseBody?.error || responseBody?.message || "Invalid input";
    throw new Error(serverMessage);
  }

  return responseBody;
}

export async function updateUserRole(email: string, role: string) {
  const encodedEmail = encodeURIComponent(email);
  return fetch(`${API_BASE_URL}/users/${encodedEmail}/role`, {
    method: "PUT",
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ role }),
  }).then((r) => r.json());
}

export async function deleteUser(email: string) {
  const encodedEmail = encodeURIComponent(email);
  return fetch(`${API_BASE_URL}/users/${encodedEmail}`, {
    method: "DELETE",
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
  });
}

// Kelas functions
export async function getKelas(page = 1, limit = 10) {
  return fetch(
    `${API_BASE_URL}/kelas?page=${page}&limit=${limit}&show_all=true`,
    {
      headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
    },
  ).then((r) => r.json());
}

export async function createKelas(data: CreateKelasRequest) {
  return fetch(`${API_BASE_URL}/kelas`, {
    method: "POST",
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  }).then((r) => r.json());
}

export async function updateKelas(classCode: string, data: UpdateKelasRequest) {
  const token = getToken();
  const url = `${API_BASE_URL}/kelas/${classCode}`;
  const requestBody = JSON.stringify(data);

  console.group("🔍 [API] updateKelas request");
  console.log("URL:", url);
  console.log("Method:", "PUT");
  console.log("Headers:", {
    ...baseHeaders,
    Authorization: token ? `Bearer ${token.slice(0, 12)}...` : null,
  });
  console.log("Raw payload object:", data);
  console.log("JSON payload:", requestBody);
  console.groupEnd();

  return fetch(url, {
    method: "PUT",
    headers: { ...baseHeaders, Authorization: `Bearer ${token}` },
    body: requestBody,
  }).then(async (r) => {
    const contentType = r.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const responseBody = isJson ? await r.json() : await r.text();

    console.group("📥 [API] updateKelas response");
    console.log("Status:", r.status, r.statusText);
    console.log("Content-Type:", contentType || "(empty)");
    console.log("Response body (full):", responseBody);
    if (typeof responseBody === "object" && responseBody !== null) {
      console.log("Response body JSON:", JSON.stringify(responseBody, null, 2));
    }
    console.groupEnd();

    if (!r.ok) {
      const serverMessage =
        typeof responseBody === "string"
          ? responseBody
          : responseBody?.error ||
            responseBody?.message ||
            "Failed to update kelas";
      throw new Error(serverMessage);
    }

    return responseBody;
  });
}

export async function deleteKelas(classCode: string) {
  return fetch(`${API_BASE_URL}/kelas/${classCode}`, {
    method: "DELETE",
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
  });
}



export async function getKelasById(classCode: string) {
  return fetch(`${API_BASE_URL}/kelas/${classCode}`, {
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
  }).then((r) => r.json());
}

export async function getPaketsByKelas(classCode: string) {
  return fetch(`${API_BASE_URL}/kelas/${classCode}/pakets`, {
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
      class_code: data.class_code,
      package_code: data.package_code,
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
    `${API_BASE_URL}/soals?page=${finalPage}&limit=${finalLimit}&show_all=true`,
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
  questionCode: string,
  signal?: AbortSignal,
): Promise<SoalDetailResponse> {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token");
  }

  const res = await fetch(`${API_BASE_URL}/soals/${questionCode}`, {
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
  questionCode: string,
  signal?: AbortSignal,
): Promise<DeleteSoalResponse> {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token");
  }

  const res = await fetch(`${API_BASE_URL}/soals/${questionCode}`, {
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
  questionCode: string,
  soalData: UpdateSoalRequest,
  signal?: AbortSignal,
): Promise<UpdateSoalResponse> {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token");
  }
  const url = `${API_BASE_URL}/soals/${questionCode}`;

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
  category_name: string;
  description?: string;
};

export type UpdateKategoriSoalRequest = {
  category_name?: string;
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
  categoryName: string,
  data: UpdateKategoriSoalRequest,
) {
  return fetch(`${API_BASE_URL}/kategori-soal/${categoryName}`, {
    method: "PUT",
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  }).then((r) => r.json());
}

export async function deleteKategoriSoal(categoryName: string) {
  return fetch(`${API_BASE_URL}/kategori-soal/${categoryName}`, {
    method: "DELETE",
    headers: { ...baseHeaders, Authorization: `Bearer ${getToken()}` },
  });
}

// Additional types
export type CreateKelasRequest = {
  class_code: string;
  name: string;
  description: string;
  price: number;
};

// Order types
export type OrderUser = {
  name: string;
  email: string;
  role?: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  city: string;
  created_at: string;
  updated_at: string;
  updated_by?: number;
  id?: number;
};

export type OrderKelas = {
  class_code?: string;
  name: string;
  description: string;
  price: number;
  id?: number;
};

export type Order = {
  order_number: string;
  email?: string;
  class_code?: string;
  payment_reference: string;
  gross_amount: number;
  status: string;
  payment_type: string;
  transaction_id: string;
  snap_token: string;
  snap_redirect_url: string;
  created_at: string;
  updated_at: string;
  user?: OrderUser;
  kelas?: OrderKelas;
  id?: number;
  user_id?: number;
  kelas_id?: number;
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
  status: "success" | "pending" | "failed";
};

export type UpdateOrderStatusResponse = {
  success: boolean;
  message: string;
};

// Update order status function
export async function updateOrderStatus(
  orderNumber: string,
  status: "success" | "pending" | "failed",
  signal?: AbortSignal,
): Promise<UpdateOrderStatusResponse> {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token");
  }

  const res = await fetch(`${API_BASE_URL}/orders/${orderNumber}/status`, {
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
