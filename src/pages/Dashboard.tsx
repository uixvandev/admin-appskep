import { useEffect, useState, useRef, useCallback } from "react";
import { Users, Archive, HelpCircle, ShoppingCart } from "lucide-react";
import * as api from "../lib/api";
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
} from "echarts/components";
import { LabelLayout, UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import PageHeader from "../components/PageHeader.tsx";

// Register the required components
echarts.use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
]);

type StatCard = {
  name: string;
  value: number;
  icon: React.ElementType;
  link: string;
  color: string;
};

export default function Dashboard() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef<HTMLDivElement>(null);
  const [revenueData, setRevenueData] = useState<{
    dates: string[];
    revenues: number[];
  }>({
    dates: [],
    revenues: [],
  });

  // Process revenue data from orders
  type Order = {
    status: string;
    created_at: string | number | Date;
    gross_amount: string | number;
  };

  const processRevenueData = useCallback((orders: Order[]) => {
    const revenueMap = new Map<string, number>();

    // Filter success orders and group by date
    const successOrders = orders.filter((order) => order.status === "success");

    successOrders.forEach((order) => {
      const date = new Date(order.created_at as string | number | Date)
        .toISOString()
        .split("T")[0];
      const amount =
        typeof order.gross_amount === "number"
          ? order.gross_amount
          : parseFloat(order.gross_amount || "0");
      revenueMap.set(date, (revenueMap.get(date) || 0) + amount);
    });

    // Get last 7 days
    const dates = [] as string[];
    const revenues = [] as number[];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const formattedDate = date.toLocaleDateString("id-ID", {
        month: "short",
        day: "numeric",
      });

      dates.push(formattedDate);
      revenues.push(revenueMap.get(dateStr) || 0);
    }

    return { dates, revenues };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      setLoading(true);
      try {
        // Fetch users
        const usersRes = await api.getUsers(1, 1);
        const totalUsers = usersRes?.data?.total_items || 0;

        // Fetch packages
        const paketsRes = await api.getPakets(1, 1);
        const totalPakets = paketsRes?.data?.total_items || 0;

        // Fetch questions
        const soalsRes = await api.getAllSoals(1, 1);
        const totalSoals = soalsRes?.data?.total_items || 0;

        // Fetch orders
        const ordersRes = await api.getAllOrders(1, 1);
        const totalOrders = ordersRes?.data?.total_items || 0;

        // Fetch all orders for revenue calculation
        const allOrdersRes = await api.getAllOrders(1, 100); // Get more orders for chart
        const orders = allOrdersRes?.data?.data || [];

        // Process revenue data by date
        const revenueByDate = processRevenueData(orders);

        if (isMounted) {
          setStats([
            {
              name: "Total Pengguna",
              value: totalUsers,
              icon: Users,
              link: "/users",
              color: "#00a1f5",
            },
            {
              name: "Paket Ujian",
              value: totalPakets,
              icon: Archive,
              link: "/packages",
              color: "#008fd9",
            },
            {
              name: "Soal Ujian",
              value: totalSoals,
              icon: HelpCircle,
              link: "/questions",
              color: "#19b6ff",
            },
            {
              name: "Total Orders",
              value: totalOrders,
              icon: ShoppingCart,
              link: "/orders",
              color: "#007bb8",
            },
          ]);

          setRevenueData(revenueByDate);
        }
      } catch {
        // fallback: show zeroes
        if (isMounted) {
          setStats([
            {
              name: "Total Pengguna",
              value: 0,
              icon: Users,
              link: "/users",
              color: "#00a1f5",
            },
            {
              name: "Paket Ujian",
              value: 0,
              icon: Archive,
              link: "/packages",
              color: "#008fd9",
            },
            {
              name: "Soal Ujian",
              value: 0,
              icon: HelpCircle,
              link: "/questions",
              color: "#19b6ff",
            },
            {
              name: "Total Orders",
              value: 0,
              icon: ShoppingCart,
              link: "/orders",
              color: "#007bb8",
            },
          ]);

          // Set default revenue data with last 7 days
          const defaultRevenueData = generateDefaultRevenueData();
          setRevenueData(defaultRevenueData);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [processRevenueData]);

  // Generate default revenue data when no orders available
  function generateDefaultRevenueData() {
    const dates = [];
    const revenues = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const formattedDate = date.toLocaleDateString("id-ID", {
        month: "short",
        day: "numeric",
      });

      dates.push(formattedDate);
      // Generate random revenue for demo purposes
      revenues.push(Math.floor(Math.random() * 1000000) + 500000);
    }

    return { dates, revenues };
  }

  // Initialize chart
  useEffect(() => {
    if (!loading && chartRef.current && revenueData.dates.length > 0) {
      const myChart = echarts.init(chartRef.current);

      const option = {
        title: {
          text: "Pendapatan Harian",
          textStyle: {
            fontSize: 16,
            fontWeight: "bold",
          },
        },
        tooltip: {
          trigger: "axis",
          formatter: function (
            params:
              | Array<{ value: number; name: string }>
              | { value: number; name: string },
          ) {
            const p = Array.isArray(params) ? params[0] : params;
            const value = p.value;
            return `${p.name}<br/>Pendapatan: Rp ${value.toLocaleString(
              "id-ID",
            )}`;
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: revenueData.dates,
          axisLine: {
            lineStyle: {
              color: "#e5e7eb",
            },
          },
          axisLabel: {
            color: "#6b7280",
          },
        },
        yAxis: {
          type: "value",
          axisLine: {
            lineStyle: {
              color: "#e5e7eb",
            },
          },
          axisLabel: {
            color: "#6b7280",
            formatter: function (value: number) {
              return value >= 1000000
                ? (value / 1000000).toFixed(1) + "M"
                : value >= 1000
                  ? (value / 1000).toFixed(0) + "K"
                  : value.toString();
            },
          },
          splitLine: {
            lineStyle: {
              color: "#f3f4f6",
            },
          },
        },
        series: [
          {
            name: "Pendapatan",
            type: "bar",
            data: revenueData.revenues,
            itemStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: "#00DDEB",
                  },
                  {
                    offset: 1,
                    color: "#006CAB",
                  },
                ],
              },
              borderRadius: [16, 16, 0, 0],
            },
            emphasis: {
              itemStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: "#00DDEB",
                    },
                    {
                      offset: 1,
                      color: "#006CAB",
                    },
                  ],
                },
              },
            },
          },
        ],
      };

      myChart.setOption(option);

      // Handle window resize
      const handleResize = () => myChart.resize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        myChart.dispose();
      };
    }
  }, [loading, revenueData]);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" />
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          Memuat statistik...
        </div>
      ) : (
        <>
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.link}
                  className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden group hover:shadow-lg transition-shadow"
                >
                  <dt>
                    <div
                      className="absolute rounded-md p-3"
                      style={{ backgroundColor: item.color }}
                    >
                      <Icon
                        size={24}
                        className="text-white"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </p>
                  </dt>
                  <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                    <p className="text-2xl font-semibold text-gray-900">
                      {item.value}
                    </p>
                  </dd>
                  <div className="absolute bottom-0 inset-x-0 bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                      <span className="font-medium text-primary group-hover:text-primary/80 cursor-pointer">
                        Detail
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </dl>

          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div
              ref={chartRef}
              style={{ width: "100%", height: "400px" }}
              className="min-h-[400px]"
            />
          </div>
        </>
      )}
    </div>
  );
}
