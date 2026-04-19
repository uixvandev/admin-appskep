import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";
import UserDetailPage from "./pages/UserDetailPage";
import KelasPage from "./pages/KelasPage";
import KelasDetailPage from "./pages/KelasDetailPage";
import PaketUjianPage from "./pages/PaketUjianPage";
import PaketUjianDetailPage from "./pages/PaketUjianDetailPage";
import TambahSoalPaketPage from "./pages/TambahSoalPaketPage";
import TambahSoalPage from "./pages/TambahSoalPage";
import QuestionsPage from "./pages/QuestionsPage";
import OrdersPage from "./pages/OrdersPage";
import Dashboard from "./pages/Dashboard";
import KategoriSoalPage from "./pages/KategoriSoalPage";
import SidebarLayout from "./components/SidebarLayout.tsx";
import ToastProvider from "./components/Toast.tsx";
import { getToken } from "./lib/api";

function App() {
  const token = getToken();

  return (
    <BrowserRouter>
      <ToastProvider />
      <Routes>
        <Route
          path="/"
          element={token ? <Navigate to="/dashboard" /> : <LoginPage />}
        />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes with SidebarLayout */}
        <Route
          path="/"
          element={token ? <SidebarLayout /> : <Navigate to="/login" />}
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path="/kelas" element={<KelasPage />} />
          <Route path="/kelas/:id" element={<KelasDetailPage />} />
          <Route path="/paket-ujian" element={<PaketUjianPage />} />
          <Route path="/packages" element={<PaketUjianPage />} />
          <Route path="/paket/:id" element={<PaketUjianDetailPage />} />
          <Route
            path="/paket/:id/tambah-soal"
            element={<TambahSoalPaketPage />}
          />
          <Route path="/soal-ujian" element={<QuestionsPage />} />
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/questions/new" element={<TambahSoalPage />} />
          <Route path="/kategori-soal" element={<KategoriSoalPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          {/* Fallback for unknown protected routes */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        {/* Global fallback */}
        <Route
          path="*"
          element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
