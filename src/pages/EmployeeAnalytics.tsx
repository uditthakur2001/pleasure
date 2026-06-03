"use client";

import {
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
// const { supabase } = await import("../lib/supabase");

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

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
  const [employees, setEmployees] = useState<any[]>([]);
  const [allVisits, setAllVisits] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState<"weekly" | "monthly">("monthly");
  const [allSales, setAllSales] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [statsRange, setStatsRange] = useState<"week" | "month" | "year">(
    "month",
  );
  const [leaderboardSales, setLeaderboardSales] = useState<any[]>([]);

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

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    visits.forEach((visit) => {
      const day = days[new Date(visit.created_at).getDay()];

      counts[day]++;
    });

    return Object.entries(counts).map(([day, visits]) => ({
      day,
      visits,
    }));
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
      setCurrentUser(user);

      const { data: allData } = await supabase
        .from("doctor_entries")
        .select("*");

      setAllVisits(allData || []);
      const { data, error } = await supabase
        .from("doctor_entries")
        .select("*")
        .eq("employee_id", user.id)
        .order("created_at", { ascending: false });

      const { data: employeeData } = await supabase
        .from("employee")
        .select("id, google_id, full_name");

      setEmployees(employeeData || []);

      const employeeRecord = employeeData?.find((e) => e.google_id === user.id);
      // Load ALL sales for leaderboard
      const { data: allSalesData } = await supabase
        .from("employee_sales")
        .select("*");

      setLeaderboardSales(allSalesData || []);

      if (employeeRecord) {
        const { data: salesData } = await supabase
          .from("employee_sales")
          .select("*")
          .eq("employee_id", employeeRecord.id);

        setAllSales(salesData || []);
      }

      // Load ONLY current employee sales for cards
      // if (currentEmployee) {
      //   const { data: salesData } = await supabase
      //     .from("employee_sales")
      //     .select("*")
      //     .eq("employee_id", currentEmployee.id);

      //   setAllSales(salesData || []);
      // }

      if (error) throw error;

      setVisits(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const leaderboard = useMemo(() => {
    const now = new Date();

    const filtered = leaderboardSales.filter((row) => {
      const d = new Date(row.report_date);

      if (statsRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return d >= weekAgo;
      }

      if (statsRange === "month") {
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }

      return d.getFullYear() === now.getFullYear();
    });

    const totals: Record<string, any> = {};

    filtered.forEach((row) => {
      const employeeId = String(row.employee_id);

      if (!totals[employeeId]) {
        totals[employeeId] = {
          employee_id: employeeId,
          sales: 0,
        };
      }

      totals[employeeId].sales += Number(row.sales || 0);
    });

    return Object.values(totals).sort((a, b) => b.sales - a.sales);
  }, [leaderboardSales, statsRange]);
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

  const visitDatesSet = useMemo(() => {
    return new Set(
      visits.map(
        (visit) => new Date(visit.created_at).toISOString().split("T")[0],
      ),
    );
  }, [visits]);

  const getEmployeeName = (employeeId: string) => {
    return (
      employees.find((e: any) => String(e.id) === String(employeeId))
        ?.full_name || "Unknown"
    );
  };

  const currentUserName =
    employees.find((e: any) => e.google_id === currentUser?.id)?.full_name ||
    "You";

  const currentEmployee = employees.find(
    (e: any) => e.google_id === currentUser?.id,
  );

  const myRank =
    leaderboard.findIndex(
      (item) => String(item.employee_id) === String(currentEmployee?.id),
    ) + 1;

  const isMobile = window.innerWidth < 640;

  const monthVisits = useMemo(() => {
    return visits.filter((visit) => {
      const visitDate = new Date(visit.created_at);

      return (
        visitDate.getMonth() === selectedMonth.getMonth() &&
        visitDate.getFullYear() === selectedMonth.getFullYear()
      );
    });
  }, [visits, selectedMonth]);

  const daysWorked = useMemo(() => {
    return new Set(
      monthVisits.map(
        (visit) => new Date(visit.created_at).toISOString().split("T")[0],
      ),
    ).size;
  }, [monthVisits]);

  const filteredVisits = useMemo(() => {
    const now = new Date();

    return visits.filter((visit) => {
      const d = new Date(visit.created_at);

      if (statsRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);

        return d >= weekAgo;
      }

      if (statsRange === "month") {
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }

      return d.getFullYear() === now.getFullYear();
    });
  }, [visits, statsRange]);

  const filteredSales = useMemo(() => {
    const now = new Date();

    return allSales.filter((row) => {
      const d = new Date(row.report_date);

      if (statsRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);

        return d >= weekAgo;
      }

      if (statsRange === "month") {
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }

      return d.getFullYear() === now.getFullYear();
    });
  }, [allSales, statsRange]);

  const rangeVisits = filteredVisits.length;

  const rangeDoctors = new Set(filteredVisits.map((v) => v.doctor_name)).size;

  const totalSalesAmount = filteredSales.reduce(
    (sum, row) => sum + Number(row.sales || 0),
    0,
  );

  const totalCollectionAmount = filteredSales.reduce(
    (sum, row) => sum + Number(row.collection || 0),
    0,
  );

  console.log("employees", employees);
  console.log("leaderboardSales", leaderboardSales);
  console.log("leaderboard", leaderboard);

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
        <div className="mb-6 flex justify-center">
          <div className="flex rounded-full bg-gray-100 p-1 shadow-sm">
            {[
              { key: "week", label: "Week" },
              { key: "month", label: "Month" },
              { key: "year", label: "Year" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setStatsRange(item.key as any)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  statsRange === item.key
                    ? "bg-white text-green-600 shadow"
                    : "text-gray-500"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Leaderboard */}
          <div className="lg:col-span-5">
            <Card title="🏆 Top Performers">
              <div className="space-y-3">
                {leaderboard.slice(0, 3).map((employee, index) => (
                  <div
                    key={employee.employee_id}
                    className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                      </div>

                      <div>
                        <div className="font-semibold">
                          {getEmployeeName(employee.employee_id)}
                        </div>

                        <div className="text-xs text-gray-500">
                          Rank #{index + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="my-4 border-t" />

                <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                  <div className="mb-2 text-sm font-medium text-green-700">
                    🎯 Your Rank
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold">
                        {myRank > 0 ? `#${myRank}` : "Not Ranked"}
                      </div>

                      <div className="text-sm text-gray-600">
                        {currentUserName}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* KPI Cards */}
          <div className="lg:col-span-7">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard title="Visits" value={rangeVisits} color="#22c55e" />

              <StatCard
                title="Doctors Covered"
                value={rangeDoctors}
                color="#3b82f6"
              />

              <StatCard
                title="Products Promoted"
                value={productsPromoted}
                color="#f97316"
              />

              <StatCard
                title="Sales"
                value={`₹${totalSalesAmount.toLocaleString()}`}
                color="#8b5cf6"
              />

              <StatCard
                title="Collection"
                value={`₹${totalCollectionAmount.toLocaleString()}`}
                color="#ec4899"
              />
            </div>
          </div>
        </div>
        {/* Middle */}

        <Card title="🏆 Product Distribution">
          <div className="h-[250px] sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productData}
                  dataKey="count"
                  nameKey="name"
                  innerRadius={isMobile ? 35 : 70}
                  outerRadius={isMobile ? 70 : 120}
                  paddingAngle={4}
                  labelLine={false}
                  label={
                    isMobile
                      ? false
                      : ({ percent }) => `${(percent * 100).toFixed(0)}%`
                  }
                >
                  {productData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {productData.slice(0, 5).map((item, index) => (
              <div
                key={item.name}
                className="flex items-center gap-2 rounded-full bg-gray-50 px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm"
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    background: COLORS[index % COLORS.length],
                  }}
                />

                <span className="truncate max-w-[100px] sm:max-w-none">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Bottom */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card title="Top Doctors">
            <div className="overflow-x-auto">
              <table className="min-w-[300px] w-full">
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
            </div>
          </Card>

          <Card title="">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  📅 Visit Attendance
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Track your daily doctor visit activity and consistency
                </p>
              </div>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-green-50 p-4">
                <p className="text-xs text-gray-500">Total Visits</p>

                <p className="mt-1 text-3xl font-bold text-green-700">
                  {totalVisits}
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-xs text-gray-500">Doctors Covered</p>

                <p className="mt-1 text-3xl font-bold text-blue-700">
                  {doctorsCovered}
                </p>
              </div>

              <div className="rounded-2xl bg-orange-50 p-4">
                <p className="text-xs text-gray-500">Products Promoted</p>

                <p className="mt-1 text-3xl font-bold text-orange-700">
                  {productsPromoted}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <DayPicker
                mode="single"
                month={selectedMonth}
                onMonthChange={setSelectedMonth}
                modifiers={{
                  visited: (date) => {
                    const formatted = `${date.getFullYear()}-${String(
                      date.getMonth() + 1,
                    ).padStart(2, "0")}-${String(date.getDate()).padStart(
                      2,
                      "0",
                    )}`;

                    return visitDatesSet.has(formatted);
                  },
                }}
                modifiersStyles={{
                  visited: {
                    backgroundColor: "#22c55e",
                    color: "white",
                    borderRadius: "999px",
                  },
                }}
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-green-50 p-4">
                <p className="text-xs text-gray-500">Days Worked</p>

                <p className="mt-1 text-3xl font-bold text-green-700">
                  {daysWorked}
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-xs text-gray-500">This Month Visits</p>

                <p className="mt-1 text-3xl font-bold text-blue-700">
                  {monthVisits.length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
