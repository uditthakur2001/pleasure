import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  supabase,
} from "@/lib/supabase";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

interface Employee {
  id: number;
  username: string;
  full_name: string;
  phone: string;
  email: string;
  role: string;
}

interface DoctorEntry {
  id: number;
  visit_date: string;
  doctor_name: string;
  products: string[];
  created_at: string;
}

const today = new Date()
  .toISOString()
  .split("T")[0];

const COLORS = [
  "#0f766e",
  "#1d4ed8",
  "#dc2626",
  "#9333ea",
  "#ea580c",
  "#059669",
  "#0284c7",
  "#ca8a04",
];

export default function AdminDashboard() {
  const navigate =
    useNavigate();

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [entries, setEntries] =
    useState<DoctorEntry[]>([]);

  const [
    employeeSearch,
    setEmployeeSearch,
  ] = useState("");

  const [
    entrySearch,
    setEntrySearch,
  ] = useState("");

  const [sortOrder, setSortOrder] =
    useState("latest");

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const workerName =
      localStorage.getItem(
        "workerName",
      );

    if (!workerName) {
      navigate("/login");
      return;
    }

    const { data } =
      await supabase
        .from("employee")
        .select("*")
        .eq(
          "username",
          workerName,
        )
        .single();

    if (
      !data ||
      data.role !== "admin"
    ) {
      navigate("/");
      return;
    }

    fetchEmployees();
    fetchEntries();
  };

  const fetchEmployees =
    async () => {
      const {
        data,
        error,
      } = await supabase
        .from("employee")
        .select("*")
        .order("id", {
          ascending: false,
        });

      if (!error && data) {
        setEmployees(data);
      }
    };

  const fetchEntries =
    async () => {
      const {
        data,
        error,
      } = await supabase
        .from("doctor_entries")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (!error && data) {
        setEntries(data);
      }
    };

  const filteredEmployees =
    employees.filter((emp) =>
      [
        emp.username,
        emp.full_name,
        emp.phone,
        emp.email,
        emp.role,
      ]
        .join(" ")
        .toLowerCase()
        .includes(
          employeeSearch.toLowerCase(),
        ),
    );

  const filteredEntries = [
    ...entries,
  ]
    .filter((entry) =>
      [
        entry.visit_date,
        entry.doctor_name,
        entry.products?.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(
          entrySearch.toLowerCase(),
        ),
    )
    .sort((a, b) => {
      if (
        sortOrder === "latest"
      ) {
        return (
          new Date(
            b.created_at,
          ).getTime() -
          new Date(
            a.created_at,
          ).getTime()
        );
      }

      return (
        new Date(
          a.created_at,
        ).getTime() -
        new Date(
          b.created_at,
        ).getTime()
      );
    });

  const totalProducts =
    entries.reduce(
      (acc, entry) =>
        acc +
        (entry.products
          ?.length || 0),
      0,
    );

  const todayEntries =
    entries.filter(
      (entry) =>
        entry.visit_date ===
        today,
    ).length;

  const productAnalytics =
    useMemo(() => {
      const counts: Record<
        string,
        number
      > = {};

      entries.forEach(
        (entry) => {
          entry.products?.forEach(
            (product) => {
              counts[
                product
              ] =
                (counts[
                  product
                ] || 0) + 1;
            },
          );
        },
      );

      return Object.entries(
        counts,
      )
        .map(
          ([
            name,
            value,
          ]) => ({
            name,
            value,
          }),
        )
        .sort(
          (a, b) =>
            b.value -
            a.value,
        )
        .slice(0, 8);
    }, [entries]);

  const doctorPerformance =
    useMemo(() => {
      const stats: Record<
        string,
        number
      > = {};

      entries.forEach(
        (entry) => {
          stats[
            entry.doctor_name
          ] =
            (stats[
              entry
                .doctor_name
            ] || 0) + 1;
        },
      );

      return Object.entries(
        stats,
      )
        .map(
          ([
            name,
            visits,
          ]) => ({
            name,
            visits,
          }),
        )
        .sort(
          (a, b) =>
            b.visits -
            a.visits,
        )
        .slice(0, 7);
    }, [entries]);

  const dailyAnalytics =
    useMemo(() => {
      const counts: Record<
        string,
        number
      > = {};

      entries.forEach(
        (entry) => {
          counts[
            entry.visit_date
          ] =
            (counts[
              entry
                .visit_date
            ] || 0) + 1;
        },
      );

      return Object.entries(
        counts,
      )
        .map(
          ([
            date,
            count,
          ]) => ({
            date,
            count,
          }),
        )
        .sort((a, b) =>
          a.date.localeCompare(
            b.date,
          ),
        );
    }, [entries]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] px-4 py-6">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Admin Dashboard
          </h1>

          <p className="mt-1 text-muted-foreground">
            Employees &
            Analytics
          </p>
        </div>

        {/* ANALYTICS */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/20 bg-white/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl">
            <p className="text-sm text-muted-foreground">
              Total Employees
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              {
                employees.length
              }
            </h2>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl">
            <p className="text-sm text-muted-foreground">
              Total Entries
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              {entries.length}
            </h2>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl">
            <p className="text-sm text-muted-foreground">
              Products Added
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              {
                totalProducts
              }
            </h2>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl">
            <p className="text-sm text-muted-foreground">
              Today's Entries
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              {
                todayEntries
              }
            </h2>
          </div>
        </div>

        {/* CHARTS */}
        <div className="mb-10 grid gap-5 xl:grid-cols-2">
          {/* BAR CHART */}
          <div className="rounded-3xl border border-white/20 bg-white/60 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl">
            <h2 className="mb-4 text-xl font-semibold">
              Top Products
            </h2>

            <div className="h-[240px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    productAnalytics
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    opacity={0.15}
                  />

                  <XAxis
                    dataKey="name"
                    tickLine={
                      false
                    }
                    axisLine={
                      false
                    }
                    fontSize={12}
                  />

                  <YAxis
                    tickLine={
                      false
                    }
                    axisLine={
                      false
                    }
                    fontSize={12}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border:
                        "none",
                      backdropFilter:
                        "blur(12px)",
                      background:
                        "rgba(255,255,255,0.85)",
                      boxShadow:
                        "0 10px 30px rgba(0,0,0,0.08)",
                    }}
                  />

                  <Bar
                    dataKey="value"
                    radius={[
                      999,
                      999,
                      0,
                      0,
                    ]}
                    fill="#0f766e"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PIE CHART */}
          <div className="rounded-3xl border border-white/20 bg-white/60 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl">
            <h2 className="mb-4 text-xl font-semibold">
              Product Distribution
            </h2>

            <div className="h-[240px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={
                      productAnalytics
                    }
                    dataKey="value"
                    nameKey="name"
                    outerRadius={
                      85
                    }
                    innerRadius={
                      45
                    }
                    label
                  >
                    {productAnalytics.map(
                      (
                        entry,
                        index,
                      ) => (
                        <Cell
                          key={
                            index
                          }
                          fill={
                            COLORS[
                              index %
                                COLORS.length
                            ]
                          }
                        />
                      ),
                    )}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border:
                        "none",
                      backdropFilter:
                        "blur(12px)",
                      background:
                        "rgba(255,255,255,0.85)",
                      boxShadow:
                        "0 10px 30px rgba(0,0,0,0.08)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* DAILY ANALYTICS */}
        <div className="mb-10 rounded-3xl border border-white/20 bg-white/60 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl">
          <h2 className="mb-4 text-xl font-semibold">
            Daily Visit Analytics
          </h2>

          <div className="h-[260px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={
                  dailyAnalytics
                }
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.15}
                />

                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border:
                      "none",
                    backdropFilter:
                      "blur(12px)",
                    background:
                      "rgba(255,255,255,0.85)",
                    boxShadow:
                      "0 10px 30px rgba(0,0,0,0.08)",
                  }}
                />

                <Bar
                  dataKey="count"
                  radius={[
                    999,
                    999,
                    0,
                    0,
                  ]}
                  fill="#1d4ed8"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DOCTOR PERFORMANCE */}
        <div className="mb-10 rounded-3xl border border-white/20 bg-white/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl">
          <h2 className="mb-5 text-2xl font-semibold">
            Doctor Visit
            Performance
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left">
                    Doctor
                  </th>

                  <th className="p-3 text-left">
                    Visits
                  </th>
                </tr>
              </thead>

              <tbody>
                {doctorPerformance.map(
                  (
                    doctor,
                    index,
                  ) => (
                    <tr
                      key={index}
                      className="border-b border-border"
                    >
                      <td className="p-3">
                        {
                          doctor.name
                        }
                      </td>

                      <td className="p-3 font-semibold">
                        {
                          doctor.visits
                        }
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* EMPLOYEES */}
        <div className="mb-10 rounded-3xl border border-white/20 bg-white/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl">
          <h2 className="mb-4 text-2xl font-semibold">
            Employees
          </h2>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search employees..."
              value={
                employeeSearch
              }
              onChange={(e) =>
                setEmployeeSearch(
                  e.target
                    .value,
                )
              }
              className="w-full rounded-xl border border-border bg-white/70 px-4 py-3 backdrop-blur-md"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left">
                    Username
                  </th>

                  <th className="p-3 text-left">
                    Name
                  </th>

                  <th className="p-3 text-left">
                    Phone
                  </th>

                  <th className="p-3 text-left">
                    Email
                  </th>

                  <th className="p-3 text-left">
                    Role
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map(
                  (emp) => (
                    <tr
                      key={emp.id}
                      className="border-b border-border"
                    >
                      <td className="p-3">
                        {
                          emp.username
                        }
                      </td>

                      <td className="p-3">
                        {emp.full_name ||
                          "-"}
                      </td>

                      <td className="p-3">
                        {emp.phone ||
                          "-"}
                      </td>

                      <td className="p-3">
                        {emp.email ||
                          "-"}
                      </td>

                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-sm ${
                            emp.role ===
                            "admin"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {
                            emp.role
                          }
                        </span>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DAILY UPDATES */}
        <div className="rounded-3xl border border-white/20 bg-white/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl">
          <h2 className="mb-4 text-2xl font-semibold">
            Daily Updates
          </h2>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Search updates..."
              value={entrySearch}
              onChange={(e) =>
                setEntrySearch(
                  e.target
                    .value,
                )
              }
              className="w-full rounded-xl border border-border bg-white/70 px-4 py-3 backdrop-blur-md"
            />

            <select
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(
                  e.target
                    .value,
                )
              }
              className="rounded-xl border border-border bg-white/70 px-4 py-3 backdrop-blur-md"
            >
              <option value="latest">
                Latest First
              </option>

              <option value="oldest">
                Oldest First
              </option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left">
                    Date
                  </th>

                  <th className="p-3 text-left">
                    Doctor
                  </th>

                  <th className="p-3 text-left">
                    Products
                  </th>

                  <th className="p-3 text-left">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredEntries.map(
                  (entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-border align-top"
                    >
                      <td className="p-3">
                        {
                          entry.visit_date
                        }
                      </td>

                      <td className="p-3">
                        {
                          entry.doctor_name
                        }
                      </td>

                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          {entry.products?.map(
                            (
                              product,
                              index,
                            ) => (
                              <span
                                key={
                                  index
                                }
                                className="rounded-full bg-secondary px-3 py-1 text-sm"
                              >
                                {
                                  product
                                }
                              </span>
                            ),
                          )}
                        </div>
                      </td>

                      <td className="p-3">
                        {new Date(
                          entry.created_at,
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}