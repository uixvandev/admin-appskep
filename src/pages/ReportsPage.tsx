import { useEffect } from "react";
import * as api from "../lib/api";
import PageHeader from "../components/PageHeader";

export default function ReportsPage() {
  useEffect(() => {
    if (!api.getToken()) {
      window.location.href = "/";
    }
  }, []);

  return (
    <div>
      <PageHeader
        title="Laporan"
        description="Lihat statistik ujian, laporan hasil ujian, dan analisis kinerja peserta."
      />

      <div className="text-center py-16 card">
        <div className="w-16 h-16 mx-auto mb-4 text-primary">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-yellow-800 text-sm">
            🚧 Fitur ini sedang dalam pengembangan.
            <br />
            Akan segera tersedia!
          </p>
        </div>
      </div>
    </div>
  );
}

