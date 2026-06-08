import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

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

export default function AdminAnalytics() {
  const [visits, setVisits] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [employeeSales, setEmployeeSales] = useState<any[]>([]);
  const [rankingPeriod, setRankingPeriod] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("daily");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editSales, setEditSales] = useState("");
  const [editCollection, setEditCollection] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase.from("doctor_entries").select("*");

      if (error) throw error;

      const { data: employeeData, error: employeeError } = await supabase
        .from("employee")
        .select("*");

      if (employeeError) throw employeeError;

      setEmployees(employeeData || []);

      const { data: salesData, error: salesError } = await supabase
        .from("employee_sales")
        .select("*");

      if (salesError) throw salesError;

      setEmployeeSales(salesData || []);

      setVisits(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = useMemo(() => {
    const now = new Date();

    return employeeSales.filter((item) => {
      const date = new Date(item.report_date);

      switch (rankingPeriod) {
        case "daily":
          return date.toDateString() === now.toDateString();

        case "weekly": {
          const startOfWeek = new Date(now);

          // Monday = first day of week
          const day = now.getDay(); // Sun=0, Mon=1, Tue=2...
          const diff = day === 0 ? -6 : 1 - day;

          startOfWeek.setDate(now.getDate() + diff);
          startOfWeek.setHours(0, 0, 0, 0);

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 7);

          return date >= startOfWeek && date < endOfWeek;
        }

        case "monthly":
          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );

        case "yearly":
          return date.getFullYear() === now.getFullYear();

        default:
          return true;
      }
    });
  }, [employeeSales, rankingPeriod]);

  const salesRanking = useMemo(() => {
    return employees
      .map((emp) => {
        const records = filteredSales.filter(
          (s) => Number(s.employee_id) === Number(emp.id),
        );

        const sales = records.reduce((sum, r) => sum + Number(r.sales || 0), 0);

        const collection = records.reduce(
          (sum, r) => sum + Number(r.collection || 0),
          0,
        );

        const firstEntry =
          records.length > 0
            ? Math.min(...records.map((r) => new Date(r.created_at).getTime()))
            : Number.MAX_SAFE_INTEGER;

        return {
          employee: emp.full_name,
          sales,
          collection,
          firstEntry,
        };
      })
      .sort((a, b) => {
        // Higher sales first
        if (b.sales !== a.sales) {
          return b.sales - a.sales;
        }

        // If sales equal, whoever submitted first wins
        return a.firstEntry - b.firstEntry;
      });
  }, [employees, filteredSales]);

  const collectionRanking = useMemo(() => {
    return employees
      .map((emp) => {
        const records = filteredSales.filter(
          (s) => Number(s.employee_id) === Number(emp.id),
        );

        const sales = records.reduce((sum, r) => sum + Number(r.sales || 0), 0);

        const collection = records.reduce(
          (sum, r) => sum + Number(r.collection || 0),
          0,
        );

        const firstEntry =
          records.length > 0
            ? Math.min(...records.map((r) => new Date(r.created_at).getTime()))
            : Number.MAX_SAFE_INTEGER;

        return {
          employee: emp.full_name,
          sales,
          collection,
          firstEntry,
        };
      })
      .sort((a, b) => {
        if (b.collection !== a.collection) {
          return b.collection - a.collection;
        }

        return a.firstEntry - b.firstEntry;
      });
  }, [employees, filteredSales]);

  const filteredSalesRanking = salesRanking.filter((emp) =>
    emp.employee.toLowerCase().includes(employeeSearch.toLowerCase()),
  );

  const filteredCollectionRanking = collectionRanking.filter((emp) =>
    emp.employee.toLowerCase().includes(employeeSearch.toLowerCase()),
  );

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

  const updateSalesRecord = async (id: number) => {
    try {
      const { error } = await supabase
        .from("employee_sales")
        .update({
          sales: Number(editSales),
          collection: Number(editCollection),
        })
        .eq("id", id);

      if (error) throw error;

      setEmployeeSales((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                sales: Number(editSales),
                collection: Number(editCollection),
              }
            : item,
        ),
      );

      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update");
    }
  };

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

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            {[
              ["daily", "Daily"],
              ["weekly", "Weekly"],
              ["monthly", "Monthly"],
              ["yearly", "Yearly"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setRankingPeriod(value as any)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  rankingPeriod === value
                    ? "bg-green-700 text-white"
                    : "border bg-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search employee..."
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              className="w-72 rounded-xl border bg-white px-4 py-2 pl-10 outline-none focus:border-green-600"
            />

            <svg
              className="absolute left-3 top-3 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title={`🏆 Sales Ranking (${rankingPeriod})`}>
            <div className="space-y-3">
              {filteredSalesRanking.map((emp, index) => {
                const actualRank =
                  salesRanking.findIndex((e) => e.employee === emp.employee) +
                  1;

                return (
                  <div
                    key={emp.employee}
                    className="flex items-center justify-between rounded-2xl border p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-800">
                        {actualRank}
                      </div>

                      <div>
                        <p className="font-semibold">{emp.employee}</p>

                        <p className="text-sm text-gray-500">
                          {actualRank === 1 && "🥇 Top Performer"}
                          {actualRank === 2 && "🥈 Runner Up"}
                          {actualRank === 3 && "🥉 Third Place"}
                        </p>
                      </div>
                    </div>

                    <div className="text-xl font-bold text-green-700">
                      ₹{emp.sales.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title={`💰 Collection Ranking (${rankingPeriod})`}>
            <div className="space-y-3">
              {filteredCollectionRanking.map((emp, index) => {
                const actualRank =
                  collectionRanking.findIndex(
                    (e) => e.employee === emp.employee,
                  ) + 1;

                return (
                  <div
                    key={emp.employee}
                    className="flex items-center justify-between rounded-2xl border p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-800">
                        {actualRank}
                      </div>

                      <div>
                        <p className="font-semibold">{emp.employee}</p>

                        <p className="text-sm text-gray-500">
                          {actualRank === 1 && "🥇 Highest Collection"}
                          {actualRank === 2 && "🥈 Runner Up"}
                          {actualRank === 3 && "🥉 Third Place"}
                        </p>
                      </div>
                    </div>

                    <div className="text-xl font-bold text-blue-700">
                      ₹{emp.collection.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <Card title="Sales Records">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left">Employee</th>
                  <th className="py-3 text-left">Sales</th>
                  <th className="py-3 text-left">Collection</th>
                  <th className="py-3 text-left">Action</th>
                </tr>
              </thead>

              <tbody>
                {[...filteredSales]
                  .sort((a, b) => {
                    const empA =
                      employees.find(
                        (e) => Number(e.id) === Number(a.employee_id),
                      )?.full_name || "";

                    const empB =
                      employees.find(
                        (e) => Number(e.id) === Number(b.employee_id),
                      )?.full_name || "";

                    return empA.localeCompare(empB);
                  })
                  .map((record) => {
                    const employee = employees.find(
                      (e) => Number(e.id) === Number(record.employee_id),
                    );

                    return (
                      <tr key={record.id} className="border-b">
                        <td className="py-3">{employee?.full_name}</td>

                        <td className="py-3">
                          {editingId === record.id ? (
                            <input
                              type="number"
                              value={editSales}
                              onChange={(e) => setEditSales(e.target.value)}
                              className="rounded border px-2 py-1"
                            />
                          ) : (
                            `₹${Number(record.sales).toLocaleString()}`
                          )}
                        </td>

                        <td className="py-3">
                          {editingId === record.id ? (
                            <input
                              type="number"
                              value={editCollection}
                              onChange={(e) =>
                                setEditCollection(e.target.value)
                              }
                              className="rounded border px-2 py-1"
                            />
                          ) : (
                            `₹${Number(record.collection).toLocaleString()}`
                          )}
                        </td>

                        <td className="py-3">
                          {editingId === record.id ? (
                            <button
                              onClick={() => updateSalesRecord(record.id)}
                              className="rounded bg-green-600 px-3 py-1 text-white"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingId(record.id);
                                setEditSales(record.sales);
                                setEditCollection(record.collection);
                              }}
                              className="rounded bg-blue-600 px-3 py-1 text-white"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
