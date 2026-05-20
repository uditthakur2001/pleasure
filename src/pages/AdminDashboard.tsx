import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabase";

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

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [entries, setEntries] =
    useState<DoctorEntry[]>([]);

const [employeeSearch, setEmployeeSearch] =
  useState("");

const [entrySearch, setEntrySearch] =
  useState("");

const [sortOrder, setSortOrder] =
  useState("latest");
  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const workerName =
      localStorage.getItem("workerName");

    if (!workerName) {
      navigate("/login");
      return;
    }

    const { data } = await supabase
      .from("employee")
      .select("*")
      .eq("username", workerName)
      .single();

    if (!data || data.role !== "admin") {
      navigate("/");
      return;
    }

    fetchEmployees();
    fetchEntries();
  };

  const fetchEmployees = async () => {
    const { data, error } =
      await supabase
        .from("employee")
        .select("*")
        .order("id", {
          ascending: false,
        });

    if (!error && data) {
      setEmployees(data);
    }
  };

  const fetchEntries = async () => {
    const { data, error } =
      await supabase
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
        employeeSearch.toLowerCase()
      )
  );

const filteredEntries = [...entries]
  .filter((entry) =>
    [
      entry.visit_date,
      entry.doctor_name,
      entry.products?.join(" "),
    ]
      .join(" ")
      .toLowerCase()
      .includes(
        entrySearch.toLowerCase()
      )
  )
  .sort((a, b) => {
    if (sortOrder === "latest") {
      return (
        new Date(
          b.created_at
        ).getTime() -
        new Date(
          a.created_at
        ).getTime()
      );
    }

    return (
      new Date(
        a.created_at
      ).getTime() -
      new Date(
        b.created_at
      ).getTime()
    );
  });

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Admin Dashboard
          </h1>

          <p className="text-muted-foreground">
            Employees & Daily Updates
          </p>
        </div>

        {/* Employees */}
        <div className="mb-10 rounded-2xl border border-border bg-card p-5 shadow-lg">
          <h2 className="mb-4 text-2xl font-semibold">
            Employees
          </h2>

        <div className="mb-4">
  <input
    type="text"
    placeholder="Search employees..."
    value={employeeSearch}
    onChange={(e) =>
      setEmployeeSearch(
        e.target.value
      )
    }
    className="w-full rounded-lg border border-border px-4 py-3"
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
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-b border-border"
                  >
                    <td className="p-3">
                      {emp.username}
                    </td>

                    <td className="p-3">
                      {emp.full_name ||
                        "-"}
                    </td>

                    <td className="p-3">
                      {emp.phone || "-"}
                    </td>

                    <td className="p-3">
                      {emp.email || "-"}
                    </td>

                    <td className="p-3 capitalize">
                      {emp.role}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Updates */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-lg">
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
        e.target.value
      )
    }
    className="w-full rounded-lg border border-border px-4 py-3"
  />

  <select
    value={sortOrder}
    onChange={(e) =>
      setSortOrder(
        e.target.value
      )
    }
    className="rounded-lg border border-border px-4 py-3"
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
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-border align-top"
                  >
                    <td className="p-3">
                      {entry.visit_date}
                    </td>

                    <td className="p-3">
                      {entry.doctor_name}
                    </td>

                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        {entry.products?.map(
                          (
                            product,
                            index
                          ) => (
                            <span
                              key={index}
                              className="rounded-full bg-secondary px-3 py-1 text-sm"
                            >
                              {product}
                            </span>
                          )
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      {new Date(
                        entry.created_at
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}