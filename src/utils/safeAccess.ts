/**
 * Utility functions for safely accessing nested object properties
 * Prevents crashes when accessing properties that might be null/undefined
 */

/**
 * Safely access nested object properties
 * @param obj - The object to access
 * @param path - The path to the property (e.g., 'user.name')
 * @param defaultValue - Default value if property doesn't exist
 * @returns The property value or default value
 */
export function safeGet<T>(obj: unknown, path: string, defaultValue: T): T {
  if (!obj || typeof obj !== "object") {
    return defaultValue;
  }

  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return defaultValue;
    }
    const rec = current as Record<string, unknown>;
    current = rec[key];
  }

  return current !== undefined ? (current as T) : defaultValue;
}

/**
 * Safely format currency with null checking
 * @param amount - The amount to format
 * @param locale - Locale for formatting (default: 'id-ID')
 * @param currency - Currency code (default: 'IDR')
 * @returns Formatted currency string or 'N/A'
 */
export function safeFormatCurrency(
  amount: number | null | undefined,
  locale: string = "id-ID",
  currency: string = "IDR"
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "N/A";
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(amount);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return "N/A";
  }
}

/**
 * Safely format date with null checking
 * @param dateString - The date string to format
 * @param locale - Locale for formatting (default: 'id-ID')
 * @returns Formatted date string or 'N/A'
 */
export function safeFormatDate(
  dateString: string | null | undefined,
  locale: string = "id-ID"
): string {
  if (!dateString) {
    return "N/A";
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "N/A";
  }
}

/**
 * Safely replace string with null checking
 * @param str - The string to process
 * @param searchValue - The value to search for
 * @param replaceValue - The value to replace with
 * @returns Processed string or 'N/A'
 */
export function safeReplace(
  str: string | null | undefined,
  searchValue: string,
  replaceValue: string
): string {
  if (!str || typeof str !== "string") {
    return "N/A";
  }

  try {
    return str.replace(searchValue, replaceValue);
  } catch (error) {
    console.error("Error replacing string:", error);
    return "N/A";
  }
}

/**
 * Safely capitalize first letter with null checking
 * @param str - The string to capitalize
 * @returns Capitalized string or 'N/A'
 */
export function safeCapitalize(str: string | null | undefined): string {
  if (!str || typeof str !== "string") {
    return "N/A";
  }

  try {
    return str.charAt(0).toUpperCase() + str.slice(1);
  } catch (error) {
    console.error("Error capitalizing string:", error);
    return "N/A";
  }
}

/**
 * Validate order object and provide fallback values
 * @param order - The order object to validate
 * @returns Validated order object with fallback values
 */
export function validateOrder(order: unknown) {
  const o =
    order && typeof order === "object"
      ? (order as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  const user =
    o.user && typeof o.user === "object"
      ? (o.user as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  const kelas =
    o.kelas && typeof o.kelas === "object"
      ? (o.kelas as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  return {
    ...o,
    id: o.id ?? "N/A",
    order_number: o.order_number ?? "N/A",
    payment_reference: o.payment_reference ?? "N/A",
    gross_amount: (typeof o.gross_amount === "number" ? o.gross_amount : 0) as number,
    payment_type: (o.payment_type as string) ?? "unknown",
    status: (o.status as string) ?? "unknown",
    transaction_id: o.transaction_id ?? "N/A",
    snap_token: o.snap_token ?? "N/A",
    snap_redirect_url: o.snap_redirect_url ?? "N/A",
    created_at: (o.created_at as string | null) ?? null,
    updated_at: (o.updated_at as string | null) ?? null,
    user: {
      id: user.id ?? "N/A",
      name: user.name ?? "N/A",
      email: user.email ?? "N/A",
      phone_number: user.phone_number ?? "N/A",
      role: user.role ?? "N/A",
      date_of_birth: user.date_of_birth ?? "N/A",
      gender: user.gender ?? "N/A",
      city: user.city ?? "N/A",
      created_at: (user.created_at as string | null) ?? null,
      updated_at: (user.updated_at as string | null) ?? null,
      updated_by: user.updated_by ?? "N/A",
    },
    kelas: {
      id: kelas.id ?? "N/A",
      name: kelas.name ?? "N/A",
      description: kelas.description ?? "N/A",
      price: (typeof kelas.price === "number" ? kelas.price : 0) as number,
    },
  };
}
