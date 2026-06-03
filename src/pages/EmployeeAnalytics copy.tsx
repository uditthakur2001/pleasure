"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

import { useEffect, useMemo, useState } from "react";
// import { supabase } from "../lib/supabase";
const { supabase } = await import("../lib/supabase");





function StatCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <h2 className="mt-2 text-4xl font-bold text-green-900">
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
      <h3 className="mb-4 text-xl font-semibold text-green-900">
        {title}
      </h3>

      {children}
    </div>
  );
}

export default function EmployeeAnalytics() {
    const [visits, setVisits] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadAnalytics();
}, []);

const loadAnalytics = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("doctor_entries")
      .select("*");
    //   .eq("employee_id", user.id)
    //   .order("created_at", { ascending: false });

    if (error) throw error;

    setVisits(data || []);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

const totalVisits = visits.length;

const doctorsCovered = new Set(
  visits.map((v) => v.doctor_name)
).size;

const productsPromoted = new Set(
  visits.flatMap((v) => v.products || [])
).size;

const thisMonthVisits = visits.filter((v) => {
  const d = new Date(v.created_at);
  const now = new Date();

  return (
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}).length;

const visitTrend = useMemo(() => {
  const grouped: Record<string, number> = {};

  visits.forEach((visit) => {
    const day = new Date(
      visit.created_at
    ).toLocaleDateString();

    grouped[day] = (grouped[day] || 0) + 1;
  });

  return Object.entries(grouped).map(
    ([day, count]) => ({
      day,
      visits: count,
    }),
  );
}, [visits]);

const productData = useMemo(() => {
  const counts: Record<string, number> = {};

  visits.forEach((visit) => {
    (visit.products || []).forEach(
      (product: string) => {
        counts[product] =
          (counts[product] || 0) + 1;
      },
    );
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
    const month = new Date(
      visit.created_at
    ).toLocaleString("default", {
      month: "short",
    });

    counts[month] =
      (counts[month] || 0) + 1;
  });

  return Object.entries(counts).map(
    ([month, visits]) => ({
      month,
      visits,
    }),
  );
}, [visits]);

const topDoctors = useMemo(() => {
  const counts: Record<string, number> = {};

  visits.forEach((visit) => {
    counts[visit.doctor_name] =
      (counts[visit.doctor_name] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([doctor, visits]) => ({
      doctor,
      visits,
    }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10);
}, [visits]);

const recentActivity = visits.slice(0, 10);

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
          <h1 className="text-5xl font-bold text-green-950">
            Analytics
          </h1>

          <p className="mt-2 text-gray-600">
            Employee Performance Dashboard
          </p>
        </div>

        {/* KPI */}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Visits"
            value={totalVisits}
          />

          <StatCard
            title="Doctors Covered"
            value={doctorsCovered}
          />

          <StatCard
            title="Products Promoted"
            value={productsPromoted}
          />

          <StatCard
            title="This Month"
            value={thisMonthVisits}
          />
        </div>

        {/* Visit Trend */}

        <Card title="Visit Trend">
          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <LineChart data={visitTrend}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="day" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="visits"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Middle */}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Product Popularity">
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Monthly Progress">
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="visits"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Bottom */}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Top Doctors">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left">
                    Doctor
                  </th>

                  <th className="py-3 text-right">
                    Visits
                  </th>
                </tr>
              </thead>

              <tbody>
                {topDoctors.map((doctor) => (
                  <tr
                    key={doctor.doctor}
                    className="border-b"
                  >
                    <td className="py-3">
                      {doctor.doctor}
                    </td>

                    <td className="py-3 text-right">
                      {doctor.visits}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card title="Recent Activity">
            <div className="space-y-3">
              {recentActivity.map((visit) => (
  <div
    key={visit.id}
    className="rounded-lg border p-4"
  >
    <div className="font-semibold">
      {visit.doctor_name}
    </div>

    <div className="text-sm text-gray-500">
      {new Date(
        visit.created_at
      ).toLocaleDateString()}
    </div>

    <div className="mt-1 text-green-800">
      {(visit.products || []).join(", ")}
    </div>
  </div>
))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}