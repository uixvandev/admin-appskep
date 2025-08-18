import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Package,
  FileText,
  ShoppingCart,
  X,
  LogOut,
  User,
} from "lucide-react";
import { clearToken } from "../lib/api";

interface SidebarLayoutProps {
  children?: ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Top bar removed -> no dropdown states needed
  const location = useLocation();
  const navigate = useNavigate();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Top bar removed -> no global click handlers needed

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: location.pathname.startsWith("/dashboard"),
    },
    {
      name: "Users",
      href: "/users",
      icon: Users,
      current: location.pathname.startsWith("/users"),
    },
    {
      name: "Kelas",
      href: "/kelas",
      icon: BookOpen,
      current: location.pathname.startsWith("/kelas"),
    },
    {
      name: "Paket Ujian",
      href: "/paket-ujian",
      icon: Package,
      current: location.pathname.startsWith("/paket-ujian") || location.pathname.startsWith("/paket/"),
    },
    {
      name: "Soal Ujian",
      href: "/soal-ujian",
      icon: FileText,
      current: location.pathname.startsWith("/soal-ujian") || location.pathname.startsWith("/questions"),
    },
    {
      name: "Orders",
      href: "/orders",
      icon: ShoppingCart,
      current: location.pathname.startsWith("/orders"),
    },
  ];

  // Top bar removed -> no user menu/notifications

  return (
    <div className="min-h-[100svh] bg-white lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`z-50 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
          fixed inset-y-0 left-0 w-64
          lg:static lg:inset-auto lg:sticky lg:top-0 lg:self-start lg:h-[100svh] lg:overflow-y-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">
              Admin Ukom
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    item.current
                      ? "bg-primary-50 text-primary-700 border-r-2 border-primary-500"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                      item.current
                        ? "text-primary-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center p-3 rounded-xl bg-gray-50">
            <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">admin@ukom.com</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearToken();
                navigate("/login", { replace: true });
              }}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="min-w-0 min-h-[100svh] lg:overflow-y-auto">
        {/* Page content only (top bar removed) */}
        <main className="w-full py-4 md:py-6 px-3 sm:px-4 lg:px-6 xl:px-8">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
