import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Package,
  FileText,
  Tag,
  ShoppingCart,
  X,
  LogOut,
  User,
} from "lucide-react";
import { clearToken } from "../../lib/api";

interface SidebarLayoutProps {
  children?: ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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
      current:
        location.pathname.startsWith("/paket-ujian") ||
        location.pathname.startsWith("/paket/"),
    },
    {
      name: "Soal Ujian",
      href: "/soal-ujian",
      icon: FileText,
      current:
        location.pathname.startsWith("/soal-ujian") ||
        location.pathname.startsWith("/questions"),
    },
    {
      name: "Kategori Soal",
      href: "/kategori-soal",
      icon: Tag,
      current: location.pathname.startsWith("/kategori-soal"),
    },
    {
      name: "Orders",
      href: "/orders",
      icon: ShoppingCart,
      current: location.pathname.startsWith("/orders"),
    },
  ];

  return (
    <div className="min-h-[100svh] bg-background lg:grid lg:grid-cols-[16rem_1fr]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`z-50 bg-surface shadow-xl transform transition-transform duration-300 ease-in-out
          fixed inset-y-0 left-0 w-64
          lg:inset-auto lg:sticky lg:top-0 lg:self-start lg:h-[100svh] lg:overflow-y-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:shadow-none lg:border-r lg:border-border`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <div className="flex items-center">
            <img
              className="h-[120px] w-auto object-contain"
              src="/src/assets/logo.png"
              alt="Appskep Logo"
            />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-muted hover:text-foreground hover:bg-surface-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
                      ? "bg-accent/10 text-foreground border-r-2 border-[color:var(--accent)]"
                      : "text-muted hover:bg-surface-secondary hover:text-foreground"
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                      item.current
                        ? "text-[color:var(--accent)]"
                        : "text-muted group-hover:text-foreground"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center p-3 rounded-xl bg-surface-secondary">
            <div className="w-8 h-8 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-foreground">Admin User</p>
              <p className="text-xs text-muted">admin@ukom.com</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearToken();
                navigate("/login", { replace: true });
              }}
              className="p-1 rounded-md text-muted hover:text-foreground hover:bg-surface"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="min-w-0 min-h-[100svh] lg:overflow-y-auto">
        <main className="w-full py-4 md:py-6 px-3 sm:px-4 lg:px-6 xl:px-8">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
