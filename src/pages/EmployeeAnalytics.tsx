"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
} from "recharts";
import { ActivityCalendar } from "react-activity-calendar";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl bg-white p-6 shadow-sm"
      style={{
        borderLeft: `6px solid ${color}`,
      }}
    >
      <p className="text-sm text-gray-500">{title}</p>

      <h2 className="mt-2 text-4xl font-bold" style={{ color }}>
        {value}
      </h2>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-xl font-semibold text-green-900">{title}</h3>

      {children}
    </div>
  );
}

export default function EmployeeAnalytics() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState<
  "weekly" | "monthly"
>("monthly");

  useEffect(() => {
    loadAnalytics();
  }, []);

  const weeklyData = useMemo(() => {
  const counts: Record<string, number> = {
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
    Sun: 0,
  };

  const days = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];

  visits.forEach((visit) => {
    const day =
      days[new Date(visit.created_at).getDay()];

    counts[day]++;
  });

  return Object.entries(counts).map(
    ([day, visits]) => ({
      day,
      visits,
    }),
  );
}, [visits]);
  const COLORS = [
    "#22c55e", // Green
    "#3b82f6", // Blue
    "#f97316", // Orange
    "#a855f7", // Purple
    "#ec4899", // Pink
    "#06b6d4", // Cyan
    "#eab308", // Yellow
    "#ef4444", // Red
    "#14b8a6", // Teal
    "#6366f1", // Indigo
  ];
  const loadAnalytics = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("doctor_entries")
        .select("*")
        .eq("employee_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setVisits(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalVisits = visits.length;

  const doctorsCovered = new Set(visits.map((v) => v.doctor_name)).size;

  const productsPromoted = new Set(visits.flatMap((v) => v.products || []))
    .size;

  const thisMonthVisits = visits.filter((v) => {
    const d = new Date(v.created_at);
    const now = new Date();

    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;
  const monthlyTarget = 100;

  const progressData = [
    {
      name: "Progress",
      value: Math.min((thisMonthVisits / monthlyTarget) * 100, 100),
    },
  ];

  const visitTrend = useMemo(() => {
    const grouped: Record<string, number> = {};

    visits.forEach((visit) => {
      const day = new Date(visit.created_at).toLocaleDateString();

      grouped[day] = (grouped[day] || 0) + 1;
    });

    return Object.entries(grouped).map(([day, count]) => ({
      day,
      visits: count,
    }));
  }, [visits]);

  const productData = useMemo(() => {
    const counts: Record<string, number> = {};

    visits.forEach((visit) => {
      (visit.products || []).forEach((product: string) => {
        counts[product] = (counts[product] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [visits]);

  const monthlyData = useMemo(() => {
    const counts: Record<string, number> = {};

    visits.forEach((visit) => {
      const month = new Date(visit.created_at).toLocaleString("default", {
        month: "short",
      });

      counts[month] = (counts[month] || 0) + 1;
    });

    return Object.entries(counts).map(([month, visits]) => ({
      month,
      visits,
    }));
  }, [visits]);

  const topDoctors = useMemo(() => {
    const counts: Record<string, number> = {};

    visits.forEach((visit) => {
      counts[visit.doctor_name] = (counts[visit.doctor_name] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([doctor, visits]) => ({
        doctor,
        visits,
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);
  }, [visits]);


  const calendarData = useMemo(() => {
    const counts: Record<string, number> = {};

    visits.forEach((visit) => {
      const date = new Date(visit.created_at).toISOString().split("T")[0];

      counts[date] = (counts[date] || 0) + 1;
    });

    return [
      {
        date: "2025-01-01",
        count: 0,
        level: 0,
      },
      ...Object.entries(counts).map(([date, count]) => ({
        date,
        count,
        level: count >= 5 ? 4 : count >= 3 ? 3 : count >= 2 ? 2 : 1,
      })),
    ];
  }, [visits]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading analytics...
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-[#f7f5f2] p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}

        <div>
          <h1 className="text-5xl font-bold text-green-950">Analytics</h1>

          <p className="mt-2 text-gray-600">Employee Performance Dashboard</p>
        </div>

        {/* KPI */}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Visits" value={totalVisits} color="#22c55e" />

          <StatCard
            title="Doctors Covered"
            value={doctorsCovered}
            color="#3b82f6"
          />

          <StatCard
            title="Products Promoted"
            value={productsPromoted}
            color="#f97316"
          />

          <StatCard title="🔥 Streak" value={7} color="#a855f7" />
        </div>

        {/* Visit Trend */}

        <Card title="Monthly Performance">
  <div className="mb-4 flex justify-between">
    <span>Target Progress</span>

    <span>
      {thisMonthVisits}/{monthlyTarget}
    </span>
  </div>

  <div className="h-4 overflow-hidden rounded-full bg-gray-200">
    <div
      className="h-full rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"
      style={{
        width: `${
          (thisMonthVisits /
            monthlyTarget) *
          100
        }%`,
      }}
    />
  </div>

  <div className="mt-4 text-center text-3xl font-bold">
    {Math.round(
      (thisMonthVisits / monthlyTarget) * 100
    )}
    %
  </div>
</Card>
        {/* Middle */}

       <Card title="🏆 Product Distribution">
  <ResponsiveContainer width="100%" height={320}>
    <PieChart>
      <Pie
        data={productData}
        dataKey="count"
        nameKey="name"
        innerRadius={70}
        outerRadius={120}
        paddingAngle={4}
        labelLine={false}
        label={({ percent }) =>
          `${(percent * 100).toFixed(0)}%`
        }
      >
        {productData.map((_, index) => (
          <Cell
            key={index}
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </Pie>

      <Tooltip
        contentStyle={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          border: "none",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.12)",
        }}
      />
    </PieChart>
  </ResponsiveContainer>

  <div className="mt-4 flex flex-wrap gap-3">
    {productData.slice(0, 5).map((item, index) => (
      <div
        key={item.name}
        className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1"
      >
        <div
          className="h-3 w-3 rounded-full"
          style={{
            background:
              COLORS[index % COLORS.length],
          }}
        />
        <span className="text-sm">
          {item.name}
        </span>
      </div>
    ))}
  </div>
</Card>

<Card title="">
  <div className="mb-6 flex items-center justify-between">
    <h3 className="text-xl font-semibold">
      📈 Growth Trend
    </h3>

    <div className="flex rounded-full bg-gray-100 p-1">
      <button
        onClick={() =>
          setChartView("weekly")
        }
        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
          chartView === "weekly"
            ? "bg-white shadow text-green-600"
            : "text-gray-500"
        }`}
      >
        Weekly
      </button>

      <button
        onClick={() =>
          setChartView("monthly")
        }
        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
          chartView === "monthly"
            ? "bg-white shadow text-green-600"
            : "text-gray-500"
        }`}
      >
        Monthly
      </button>
    </div>
  </div>

  <ResponsiveContainer
    width="100%"
    height={320}
  >
    <AreaChart
      data={
        chartView === "weekly"
          ? weeklyData
          : monthlyData
      }
    >
      <defs>
        <linearGradient
          id="growthGradient"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="5%"
            stopColor="#22c55e"
            stopOpacity={0.8}
          />

          <stop
            offset="95%"
            stopColor="#22c55e"
            stopOpacity={0}
          />
        </linearGradient>
      </defs>

      <CartesianGrid
        vertical={false}
        strokeDasharray="3 3"
      />

      <XAxis
        dataKey={
          chartView === "weekly"
            ? "day"
            : "month"
        }
      />

      <YAxis />

      <Tooltip
        contentStyle={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          border: "none",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.12)",
        }}
      />

      <Area
        type="monotone"
        dataKey="visits"
        stroke="#22c55e"
        strokeWidth={4}
        fill="url(#growthGradient)"
      />
    </AreaChart>
  </ResponsiveContainer>

  <div className="mt-4 flex items-center justify-between">
    <span className="text-sm text-gray-500">
      {chartView === "weekly"
        ? "Weekly Performance"
        : "Monthly Performance"}
    </span>

    <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
      {chartView === "weekly"
        ? "This Week"
        : "This Month"}
    </span>
  </div>
</Card>

        {/* Bottom */}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Top Doctors">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left">Doctor</th>

                  <th className="py-3 text-right">Visits</th>
                </tr>
              </thead>

              <tbody>
                {topDoctors.map((doctor) => (
                  <tr key={doctor.doctor} className="border-b">
                    <td className="py-3">{doctor.doctor}</td>

                    <td className="py-3 text-right">{doctor.visits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card title="🔥 Activity Overview">
  <div className="mb-6 flex items-center justify-between">
    <div>
      <h3 className="text-lg font-semibold">
        Daily Visit Activity
      </h3>

      <p className="text-sm text-gray-500">
        Your doctor visit consistency
      </p>
    </div>

    <div className="rounded-xl bg-green-50 px-4 py-2">
      <span className="text-sm text-green-700">
        {totalVisits} Total Visits
      </span>
    </div>
  </div>

  <ActivityCalendar
    data={calendarData}
    blockSize={14}
    blockMargin={5}
    fontSize={14}
    showWeekdayLabels
    theme={{
      light: [
        "#f1f5f9",
        "#86efac",
        "#4ade80",
        "#22c55e",
        "#15803d",
      ],
      dark: [
        "#0f172a",
        "#14532d",
        "#16a34a",
        "#22c55e",
        "#4ade80",
      ],
    }}
  />

  <div className="mt-6 flex gap-6 text-sm">
    <div className="flex items-center gap-2">
      <div className="h-3 w-3 rounded bg-slate-200" />
      Low
    </div>

    <div className="flex items-center gap-2">
      <div className="h-3 w-3 rounded bg-green-300" />
      Medium
    </div>

    <div className="flex items-center gap-2">
      <div className="h-3 w-3 rounded bg-green-600" />
      High
    </div>
  </div>
</Card>

          
        </div>
      </div>
    </div>
  );
}
