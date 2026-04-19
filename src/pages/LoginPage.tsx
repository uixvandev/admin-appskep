import { useEffect, useState } from "react";
import { getToken, login, saveToken } from "../lib/api";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getToken()) {
      window.location.href = "/dashboard";
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res.success && res.data?.token) {
        if (res.data.user?.role !== "admin") {
          setError("Akses ditolak! Anda bukan admin.");
          setLoading(false);
          return;
        }
        saveToken(res.data.token);
        window.location.href = "/dashboard";
      } else {
        setError(res.message || res.error || "Login failed.");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "A network error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <img className="h-56 mx-auto" src="/src/assets/logo.png" alt="" />
          <h1 className="text-3xl font-bold text-gray-900">Selamat Datang</h1>
          <p className="mt-2 text-gray-600">
            Masuk untuk melanjutkan ke dasbor admin UKOM.
          </p>
        </div>

        <div className="card p-8">
          {error && (
            <div
              role="alert"
              className="px-4 py-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg mb-6"
            >
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6" autoComplete="off">
            <div>
              <label htmlFor="email" className="label">
                Alamat Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@appskep.com"
                autoComplete="off"
                required
                className="input w-full mt-1"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Kata Sandi
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  autoComplete="off"
                  required
                  className="input w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-primary"
                  aria-label={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="form-checkbox"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Ingat saya
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-primary hover:text-primary/80"
                >
                  Lupa kata sandi?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? "Masuk..." : "Masuk"}
              </button>
            </div>
          </form>
        </div>
        <p className="text-sm text-center text-gray-500">
          © {new Date().getFullYear()} Appskep. Hak cipta dilindungi.
        </p>
      </div>
    </div>
  );
}
