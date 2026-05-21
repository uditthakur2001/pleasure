import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabase";

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

import { successAlert, errorAlert, confirmAlert } from "@/lib/alert";

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
  doctor_phone: string;
  employee_name?: string;
  employee_username?: string;
  products: string[];
  created_at: string;
}

const today = new Date().toISOString().split("T")[0];

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
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<Employee[]>([]);

  const [entries, setEntries] = useState<DoctorEntry[]>([]);

  const [employeeSearch, setEmployeeSearch] = useState("");

  const [entrySearch, setEntrySearch] = useState("");

  const [sortOrder, setSortOrder] = useState("latest");

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const workerName = localStorage.getItem("workerName");

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
    fetchProducts();
  };

  const fetchEmployees = async () => {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from("doctor_entries")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.log(error);
      return;
    }

    // FETCH EMPLOYEES
    const { data: employeesData } = await supabase
      .from("employee")
      .select("id, username, full_name");

    // MAP EMPLOYEE DATA
    const formatted = data.map((item: any) => {
      const employee = employeesData?.find(
        (emp) => emp.id === item.employee_id,
      );

      return {
        ...item,

        employee_name: employee?.full_name || "-",

        employee_username: employee?.username || "-",
      };
    });

    setEntries(formatted);
  };
  // UPDATE ROLE
  const updateEmployeeRole = async (id: number, currentRole: string) => {
    const newRole = currentRole === "admin" ? "employee" : "admin";

    const result = await confirmAlert("Change Role?", `Make user ${newRole}?`);

    if (!result.isConfirmed) return;

    const { error } = await supabase
      .from("employee")
      .update({
        role: newRole,
      })
      .eq("id", id);

    if (error) {
      errorAlert("Update Failed", error.message);

      return;
    }

    successAlert("Role Updated");

    fetchEmployees();
  };

  // DELETE EMPLOYEE
  const deleteEmployee = async (id: number) => {
    const result = await confirmAlert(
      "Delete Employee?",
      "This action cannot be undone",
    );

    if (!result.isConfirmed) return;

    const { error } = await supabase.from("employee").delete().eq("id", id);

    if (error) {
      errorAlert("Delete Failed", error.message);

      return;
    }

    successAlert("Employee Deleted");

    fetchEmployees();
  };

  const filteredEmployees = employees.filter((emp) =>
    [emp.username, emp.full_name, emp.phone, emp.email, emp.role]
      .join(" ")
      .toLowerCase()
      .includes(employeeSearch.toLowerCase()),
  );

  const filteredEntries = [...entries]
    .filter((entry) =>
      [entry.visit_date, entry.doctor_name, entry.products?.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(entrySearch.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortOrder === "latest") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

  const totalProducts = entries.reduce(
    (acc, entry) => acc + (entry.products?.length || 0),
    0,
  );

  const todayEntries = entries.filter(
    (entry) => entry.visit_date === today,
  ).length;

  const productAnalytics = useMemo(() => {
    const counts: Record<string, number> = {};

    entries.forEach((entry) => {
      entry.products?.forEach((product) => {
        counts[product] = (counts[product] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [entries]);

  const dailyAnalytics = useMemo(() => {
    const counts: Record<string, number> = {};

    entries.forEach((entry) => {
      counts[entry.visit_date] = (counts[entry.visit_date] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [entries]);



  //product details

  const [productsData, setProductsData] =
  useState<any[]>([]);

const [editingProduct, setEditingProduct] =
  useState<any>(null);

const [showProductManager, setShowProductManager] =
  useState(false);

const [productName, setProductName] =
  useState("");

const [productTagline, setProductTagline] =
  useState("");

const [productCategory, setProductCategory] =
  useState("Injection");

const [productComposition, setProductComposition] =
  useState("");

const [productDosage, setProductDosage] =
  useState("");

const [productDescription, setProductDescription] =
  useState("");

const [productBenefits, setProductBenefits] =
  useState("");

const [productIndications, setProductIndications] =
  useState("");

const [productImages, setProductImages] =
  useState<string[]>([]);

  const fetchProducts =
  async () => {
    const { data, error } =
      await supabase
        .from("products")
        .select("*")
        .order("id", {
          ascending: false,
        });

    if (!error && data) {
      setProductsData(data);
    }
  };


const uploadProductImage =
  async (
    file: File,
  ) => {
    const fileName = `${Date.now()}-${file.name}`;

    const { error } =
      await supabase.storage
        .from(
          "product-images",
        )
        .upload(
          fileName,
          file,
        );

    if (error) {
      errorAlert(
        "Upload Failed",
        error.message,
      );

      return null;
    }

    const { data } =
      supabase.storage
        .from(
          "product-images",
        )
        .getPublicUrl(
          fileName,
        );

    return data.publicUrl;
  };


  const saveProduct =
  async () => {
    if (!productName) {
      errorAlert(
        "Required",
        "Product name required",
      );

      return;
    }

    const payload = {
      slug:
        productName
          .toLowerCase()
          .replace(/\s+/g, "-"),

      name: productName,

      tagline:
        productTagline,

      category:
        productCategory,

      composition:
        productComposition,

      dosage:
        productDosage,

      description:
        productDescription,

      benefits:
        productBenefits
          .split(","),

      indications:
        productIndications.split(
          ",",
        ),

      image_urls:
        productImages,
    };

    let response;

    if (editingProduct) {
      response =
        await supabase
          .from(
            "products",
          )
          .update(payload)
          .eq(
            "id",
            editingProduct.id,
          );
    } else {
      response =
        await supabase
          .from(
            "products",
          )
          .insert([
            payload,
          ]);
    }

    if (response.error) {
      errorAlert(
        "Error",
        response.error.message,
      );

      return;
    }

    successAlert(
      editingProduct
        ? "Product Updated"
        : "Product Added",
    );

  resetProductForm();
  };

  const resetProductForm = () => {
  setEditingProduct(null);

  setProductName("");

  setProductTagline("");

  setProductCategory("Injection");

  setProductComposition("");

  setProductDosage("");

  setProductDescription("");

  setProductBenefits("");

  setProductIndications("");

  setProductImages([]);
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] px-4 py-5">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Employees & Analytics
          </p>
        </div>

        {/* ANALYTICS */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/20 bg-white/60 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl">
            <p className="text-xs text-muted-foreground">Total Employees</p>

            <h2 className="mt-1 text-3xl font-bold">{employees.length}</h2>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/60 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl">
            <p className="text-xs text-muted-foreground">Total Entries</p>

            <h2 className="mt-1 text-3xl font-bold">{entries.length}</h2>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/60 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl">
            <p className="text-xs text-muted-foreground">Products Added</p>

            <h2 className="mt-1 text-3xl font-bold">{totalProducts}</h2>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/60 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl">
            <p className="text-xs text-muted-foreground">Today's Entries</p>

            <h2 className="mt-1 text-3xl font-bold">{todayEntries}</h2>
          </div>
        </div>

        {/* CHARTS */}
        <div className="mb-6 grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/20 bg-white/60 p-3 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl">
            <h2 className="mb-3 text-lg font-semibold">Top Products</h2>

            <div className="h-[180px]">
              <ResponsiveContainer>
                <BarChart data={productAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />

                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />

                  <YAxis tickLine={false} axisLine={false} fontSize={11} />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    radius={[999, 999, 0, 0]}
                    fill="#0f766e"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/60 p-3 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl">
            <h2 className="mb-3 text-lg font-semibold">Product Distribution</h2>

            <div className="h-[180px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={productAnalytics}
                    dataKey="value"
                    outerRadius={65}
                    innerRadius={35}
                  >
                    {productAnalytics.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>


<div className="mb-6">
  <button
    onClick={() =>
      setShowProductManager(
        !showProductManager,
      )
    }
    className="rounded-xl bg-primary px-5 py-3 text-white"
  >
    {showProductManager
      ? "Close Product Manager"
      : "Open Product Manager"}
  </button>
</div>

{showProductManager && (
  <div className="mb-6 overflow-hidden rounded-3xl border border-white/20 bg-white/70 shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-2xl">
    
    {/* HEADER */}
    <div className="flex items-center justify-between border-b border-border p-5">
      <div>
        <h2 className="text-2xl font-bold">
          Product Manager
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Add, edit and manage products dynamically
        </p>
      </div>

      <button
        onClick={() =>
          setShowProductManager(false)
        }
        className="rounded-xl border px-4 py-2 text-sm"
      >
        Close
      </button>
    </div>

    {/* FORM */}
    <div className="grid gap-4 p-5 lg:grid-cols-2">
      <input
        type="text"
        placeholder="Product Name"
        value={productName}
        onChange={(e) =>
          setProductName(
            e.target.value,
          )
        }
        className="rounded-2xl border bg-white px-4 py-3"
      />

      <input
        type="text"
        placeholder="Tagline"
        value={productTagline}
        onChange={(e) =>
          setProductTagline(
            e.target.value,
          )
        }
        className="rounded-2xl border bg-white px-4 py-3"
      />

      <select
        value={productCategory}
        onChange={(e) =>
          setProductCategory(
            e.target.value,
          )
        }
        className="rounded-2xl border bg-white px-4 py-3"
      >
        <option>
          Injection
        </option>

        <option>Bolus</option>

        <option>Powder</option>

        <option>Syrup</option>
      </select>

      <input
        type="text"
        placeholder="Composition"
        value={productComposition}
        onChange={(e) =>
          setProductComposition(
            e.target.value,
          )
        }
        className="rounded-2xl border bg-white px-4 py-3"
      />

      <textarea
        placeholder="Full Product Description"
        value={productDescription}
        onChange={(e) =>
          setProductDescription(
            e.target.value,
          )
        }
        className="min-h-[160px] rounded-2xl border bg-white px-4 py-3 lg:col-span-2"
      />

      <textarea
        placeholder="Indications (comma separated)"
        value={productIndications}
        onChange={(e) =>
          setProductIndications(
            e.target.value,
          )
        }
        className="min-h-[130px] rounded-2xl border bg-white px-4 py-3"
      />

      <textarea
        placeholder="Benefits (comma separated)"
        value={productBenefits}
        onChange={(e) =>
          setProductBenefits(
            e.target.value,
          )
        }
        className="min-h-[130px] rounded-2xl border bg-white px-4 py-3"
      />

      <input
        type="text"
        placeholder="Dosage"
        value={productDosage}
        onChange={(e) =>
          setProductDosage(
            e.target.value,
          )
        }
        className="rounded-2xl border bg-white px-4 py-3"
      />

      <div className="rounded-2xl border bg-white p-4">
        <label className="mb-3 block text-sm font-medium">
          Upload Product Images
        </label>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={async (e) => {
            const files =
              Array.from(
                e.target.files || [],
              );

            const uploadedUrls =
              [];

            for (const file of files) {
              const url =
                await uploadProductImage(
                  file,
                );

              if (url) {
                uploadedUrls.push(
                  url,
                );
              }
            }

            setProductImages(
              uploadedUrls,
            );
          }}
        />

        {/* PREVIEW */}
        <div className="mt-4 flex flex-wrap gap-3">
          {productImages.map(
            (img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                className="h-20 w-20 rounded-xl object-cover shadow"
              />
            ),
          )}
        </div>
      </div>
    </div>

    {/* ACTION */}
    <div className="flex flex-wrap gap-3">
  <button
    onClick={saveProduct}
    className="rounded-2xl bg-primary px-6 py-3 font-medium text-white"
  >
    {editingProduct
      ? "Update Product"
      : "Add Product"}
  </button>

  {editingProduct && (
    <button
      onClick={resetProductForm}
      className="rounded-2xl border px-6 py-3 font-medium"
    >
      Cancel Edit
    </button>
  )}
</div>

    {/* PRODUCT LIST */}
    <div className="border-t border-border p-5">
      <h3 className="mb-4 text-lg font-semibold">
        Existing Products
      </h3>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {productsData.map(
          (product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-2xl border bg-white shadow-sm"
            >
              <img
                src={
                  product.image_urls?.[0] ||
                  "/placeholder.webp"
                }
                alt=""
                className="h-48 w-full object-cover"
              />

              <div className="p-4">
                <h3 className="font-semibold">
                  {product.name}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {product.category}
                </p>

                <p className="mt-2 line-clamp-2 text-sm">
                  {
                    product.tagline
                  }
                </p>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingProduct(
                        product,
                      );

                      setProductName(
                        product.name,
                      );

                      setProductTagline(
                        product.tagline,
                      );

                      setProductCategory(
                        product.category,
                      );

                      setProductComposition(
                        product.composition,
                      );

                      setProductDosage(
                        product.dosage,
                      );

                      setProductDescription(
                        product.description,
                      );

                      setProductBenefits(
                        product.benefits?.join(
                          ",",
                        ),
                      );

                      setProductIndications(
                        product.indications?.join(
                          ",",
                        ),
                      );

                      setProductImages(
                        product.image_urls ||
                          [],
                      );
                    }}
                    className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white"
                  >
                    Edit
                  </button>

                  <button
                    onClick={async () => {
                      const result =
                        await confirmAlert(
                          "Delete Product?",
                          "This cannot be undone",
                        );

                      if (
                        !result.isConfirmed
                      )
                        return;

                      await supabase
                        .from(
                          "products",
                        )
                        .delete()
                        .eq(
                          "id",
                          product.id,
                        );

                      successAlert(
                        "Product Deleted",
                      );

                      fetchProducts();
                    }}
                    className="flex-1 rounded-xl bg-red-500 px-4 py-2 text-sm text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  </div>
)}

        {/* EMPLOYEES */}
        <div className="rounded-2xl border border-white/20 bg-white/60 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl">
          <h2 className="mb-3 text-xl font-semibold">Employees</h2>

          <div className="mb-3">
            <input
              type="text"
              placeholder="Search employees..."
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-white/70 px-3 py-2.5 text-sm"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-2.5 text-left text-sm">Username</th>

                  <th className="p-2.5 text-left text-sm">Name</th>

                  <th className="p-2.5 text-left text-sm">Phone</th>

                  <th className="p-2.5 text-left text-sm">Email</th>

                  <th className="p-2.5 text-left text-sm">Role</th>

                  <th className="p-2.5 text-left text-sm">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="border-b border-border">
                    <td className="p-2.5 text-sm">{emp.username}</td>

                    <td className="p-2.5 text-sm">{emp.full_name || "-"}</td>

                    <td className="p-2.5 text-sm">{emp.phone || "-"}</td>

                    <td className="p-2.5 text-sm">{emp.email || "-"}</td>

                    <td className="p-2.5 text-sm">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          emp.role === "admin"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {emp.role}
                      </span>
                    </td>

                    <td className="p-2.5 text-sm">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => updateEmployeeRole(emp.id, emp.role)}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white transition hover:opacity-90"
                        >
                          {emp.role === "admin" ? "Remove Admin" : "Make Admin"}
                        </button>

                        <button
                          onClick={() => deleteEmployee(emp.id)}
                          className="rounded-lg bg-red-500 px-3 py-1.5 text-xs text-white transition hover:opacity-90"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DAILY UPDATES */}
        <div className="mt-6 rounded-2xl border border-white/20 bg-white/60 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl">
          <h2 className="mb-3 text-xl font-semibold">Daily Updates</h2>

          <div className="mb-3 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Search updates..."
              value={entrySearch}
              onChange={(e) => setEntrySearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-white/70 px-3 py-2.5 text-sm"
            />

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="rounded-xl border border-border bg-white/70 px-3 py-2.5 text-sm"
            >
              <option value="latest">Latest First</option>

              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-2.5 text-left text-sm">Date</th>

                  <th className="p-2.5 text-left text-sm">Doctor</th>

                  <th className="p-2.5 text-left text-sm">Employee</th>

                  <th className="p-2.5 text-left text-sm">Products</th>

                  <th className="p-2.5 text-left text-sm">Created</th>
                </tr>
              </thead>

              <tbody>
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-border align-top"
                  >
                    <td className="p-2.5 text-sm">{entry.visit_date}</td>

                    <td className="p-2.5 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium">{entry.doctor_name}</span>

                        <span className="text-xs text-muted-foreground">
                          {entry.doctor_phone || "No Number"}
                        </span>
                      </div>
                    </td>

                    <td className="p-2.5 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {entry.employee_name || "-"}
                        </span>

                        <span className="text-xs text-muted-foreground">
                          {entry.employee_username || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="p-2.5 text-sm">
                      <div className="flex flex-wrap gap-2">
                        {entry.products?.map((product, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-secondary px-2.5 py-1 text-xs"
                          >
                            {product}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-2.5 text-sm">
                      {new Date(entry.created_at).toLocaleString()}
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
