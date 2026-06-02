import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabase";

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

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
  Legend,
} from "recharts";

import { successAlert, errorAlert, confirmAlert } from "@/lib/alert";

interface Employee {
  id: string;
  google_id?: string;
  // username: string;
  full_name: string;
  phone: string;
  email: string;
  role: string;
}

interface DoctorEntry {
  id: string;
  visit_date: string;
  doctor_name: string;
  doctor_phone: string;
  employee_name?: string;
  // employee_username?: string;
  employee_email?: string;
  products: string[];
  latitude?: number;
  longitude?: number;
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

function SortableImage({
  image,
  index,
  onRemove,
}: {
  image: string;
  index: number;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: image,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative cursor-move"
    >
      <img
        src={image}
        alt=""
        className="h-20 w-20 rounded-xl border object-cover"
      />

      <div className="absolute left-1 top-1 rounded bg-black/70 px-1 text-xs text-white">
        {index + 1}
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow"
      >
        ✕
      </button>
    </div>
  );
}

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
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    const role = localStorage.getItem("role");

    if (!isLoggedIn) {
      navigate("/login");

      return;
    }

    if (role !== "admin") {
      navigate("/dashboard");

      return;
    }

    fetchEmployees();

    fetchEntries();

    fetchProducts();

    fetchVisitors();
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
      .select("id, google_id, full_name, email");

    // MAP EMPLOYEE DATA
    const formatted = data.map((item: any) => {
      const employee = employeesData?.find(
        (emp) => emp.google_id === item.employee_id,
      );

      return {
        ...item,

        employee_name: employee?.full_name || "-",

        // employee_username: employee?.username || "-",

        employee_email: employee?.email || "-",
      };
    });

    setEntries(formatted);
  };
  // UPDATE ROLE
  const updateEmployeeRole = async (id: string, currentRole: string) => {
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
  const deleteEmployee = async (id: string) => {
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
    fetchEntries();
  };

  // ADD EMPLOYEE
  const addEmployee = async () => {
    if (!employeeEmail) {
      errorAlert("Required", "Employee email required");

      return;
    }
    if (!employeeEmail.toLowerCase().endsWith("@gmail.com")) {
      errorAlert("Invalid Email", "Only Gmail accounts are allowed");

      return;
    }
    const { error } = await supabase.from("employee").insert([
      {
        // username: employeeUsername,

        full_name: employeeFullName,

        phone: employeePhone,

        email: employeeEmail,

        role: employeeRole,
      },
    ]);

    if (error) {
      errorAlert("Error", error.message);

      return;
    }

    successAlert("Employee Added");

    // setEmployeeUsername("");

    setEmployeeFullName("");

    setEmployeePhone("");

    setEmployeeEmail("");

    setEmployeeRole("employee");

    setShowAddEmployee(false);

    fetchEmployees();
  };

  const filteredEmployees = employees.filter((emp) =>
    [ emp.full_name, emp.phone, emp.email, emp.role]
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

  const [productsData, setProductsData] = useState<any[]>([]);

  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [showProductManager, setShowProductManager] = useState(false);

  const [productName, setProductName] = useState("");

  const [productTagline, setProductTagline] = useState("");

  const [productCategory, setProductCategory] = useState("Injection");

  const [productComposition, setProductComposition] = useState("");

  const [productDosage, setProductDosage] = useState("");

  const [productDescription, setProductDescription] = useState("");

  const [productBenefits, setProductBenefits] = useState("");

  const [productIndications, setProductIndications] = useState("");

  const [productImages, setProductImages] = useState<string[]>([]);

  const [productVariants, setProductVariants] = useState<any[]>([]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", {
        ascending: false,
      });

    if (!error && data) {
      setProductsData(data);
    }
  };

  const uploadProductImage = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (error) {
      errorAlert("Upload Failed", error.message);

      return null;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const saveProduct = async () => {
    if (!productName) {
      errorAlert("Required", "Product name required");

      return;
    }

    const payload = {
      slug: productName.toLowerCase().replace(/\s+/g, "-"),

      name: productName,

      tagline: productTagline,

      category: productCategory,

      composition: productComposition,

      dosage: productDosage,

      description: productDescription,

      benefits: productBenefits.split(",").map((b) => b.trim()),

      indications: productIndications.split(",").map((i) => i.trim()),

      image_urls: productImages,

      variants: productVariants,
      show_on_home: false,
    };

    let response;

    if (editingProduct) {
      response = await supabase
        .from("products")
        .update(payload)
        .eq("id", editingProduct.id);
    } else {
      response = await supabase.from("products").insert([payload]);
    }

    if (response.error) {
      errorAlert("Error", response.error.message);

      return;
    }

    successAlert(editingProduct ? "Product Updated" : "Product Added");

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

    setProductVariants([]);
  };

  // ADD EMPLOYEE STATES
  const [showAddEmployee, setShowAddEmployee] = useState(false);

  // const [employeeUsername, setEmployeeUsername] = useState("");

  const [employeeFullName, setEmployeeFullName] = useState("");

  const [employeePhone, setEmployeePhone] = useState("");

  const [employeeEmail, setEmployeeEmail] = useState("");

  const [employeeRole, setEmployeeRole] = useState("employee");

  //Visitors
  const [totalVisitors, setTotalVisitors] = useState(0);

  const [todayVisitors, setTodayVisitors] = useState(0);

  const fetchVisitors = async () => {
    const { count: totalCount } = await supabase
      .from("website_visitors")
      .select("*", {
        count: "exact",
        head: true,
      });

    const today = new Date().toISOString().split("T")[0];

    const { count: todayCount } = await supabase
      .from("website_visitors")
      .select("*", {
        count: "exact",
        head: true,
      })
      .gte("visited_at", `${today}T00:00:00`);

    setTotalVisitors(totalCount || 0);

    setTodayVisitors(todayCount || 0);
  };

  //drag n drop arrange
  const handleImageDragEnd = (event: any) => {
  const { active, over } = event;

  if (!over || active.id === over.id) return;

  setProductImages((items) => {
    const oldIndex = items.indexOf(active.id);
    const newIndex = items.indexOf(over.id);

    return arrayMove(items, oldIndex, newIndex);
  });
};

const handleVariantImageDragEnd = (
  variantIndex: number,
  event: any,
) => {
  const { active, over } = event;

  if (!over || active.id === over.id) return;

  setProductVariants((prev) => {
    const updated = [...prev];

    const images = [...updated[variantIndex].images];

    const oldIndex = images.indexOf(active.id);
    const newIndex = images.indexOf(over.id);

    updated[variantIndex].images = arrayMove(
      images,
      oldIndex,
      newIndex,
    );

    return updated;
  });
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
        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
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

          <div className="rounded-2xl border border-white/20 bg-white/60 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl">
            <p className="text-xs text-muted-foreground">Total Visitors</p>

            <h2 className="mt-1 text-3xl font-bold">{totalVisitors}</h2>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/60 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl">
            <p className="text-xs text-muted-foreground">Today's Visitors</p>

            <h2 className="mt-1 text-3xl font-bold">{todayVisitors}</h2>
          </div>
        </div>

        {/* CHARTS */}
        <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/20 bg-white/60 p-2 sm:p-3 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl">
            <h2 className="mb-3 text-lg font-semibold">Top Products</h2>

            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />

                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    fontSize={9}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                    tick={({ x, y, payload, index }) => (
                      <text
                        x={x}
                        y={y}
                        dy={10}
                        textAnchor="end"
                        transform={`rotate(-20, ${x}, ${y})`}
                        fill={COLORS[index % COLORS.length]}
                        fontSize={9}
                      >
                        {payload.value}
                      </text>
                    )}
                  />

                  <YAxis
                    width={25}
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    tick={{
                      fill: "#0f766e",
                    }}
                  />

                  <Tooltip />

                  <Bar dataKey="value" radius={[999, 999, 0, 0]}>
                    {productAnalytics.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/60 p-2 sm:p-3 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl">
            <h2 className="mb-3 text-lg font-semibold">Product Distribution</h2>

            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productAnalytics}
                    dataKey="value"
                    nameKey="name"
                    cx="40%"
                    cy="50%"
                    outerRadius={65}
                    innerRadius={35}
                  >
                    {productAnalytics.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    formatter={(value, entry: any) =>
                      `${value} (${entry.payload.value})`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowProductManager(!showProductManager)}
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
                <h2 className="text-2xl font-bold">Product Manager</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Add, edit and manage products dynamically
                </p>
              </div>

              <button
                onClick={() => setShowProductManager(false)}
                className="rounded-xl border px-4 py-2 text-sm"
              >
                Close
              </button>
            </div>

            {/* FORM */}
            <div className="grid gap-4 p-5 lg:grid-cols-2">
              {/* PRODUCT NAME */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Product Name
                </h3>

                <input
                  type="text"
                  placeholder="Enter product name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full rounded-2xl border bg-white px-4 py-3"
                />
              </div>

              {/* TAGLINE */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Tagline
                </h3>

                <input
                  type="text"
                  placeholder="Enter tagline"
                  value={productTagline}
                  onChange={(e) => setProductTagline(e.target.value)}
                  className="w-full rounded-2xl border bg-white px-4 py-3"
                />
              </div>

              {/* CATEGORY */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Category
                </h3>

                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="w-full rounded-2xl border bg-white px-4 py-3"
                >
                  <option>Injection</option>

                  <option>Bolus</option>

                  <option>Powder</option>

                  <option>Syrup</option>
                </select>
              </div>

              {/* COMPOSITION */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Composition
                </h3>

                <input
                  type="text"
                  placeholder="Enter composition"
                  value={productComposition}
                  onChange={(e) => setProductComposition(e.target.value)}
                  className="w-full rounded-2xl border bg-white px-4 py-3"
                />
              </div>

              {/* DESCRIPTION */}
              <div className="lg:col-span-2">
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Product Description
                </h3>

                <textarea
                  placeholder="Enter full product description"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="min-h-[160px] w-full rounded-2xl border bg-white px-4 py-3"
                />
              </div>

              {/* INDICATIONS */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Indications
                </h3>

                <textarea
                  placeholder="Comma separated indications"
                  value={productIndications}
                  onChange={(e) => setProductIndications(e.target.value)}
                  className="min-h-[130px] w-full rounded-2xl border bg-white px-4 py-3"
                />
              </div>

              {/* BENEFITS */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Benefits
                </h3>

                <textarea
                  placeholder="Comma separated benefits"
                  value={productBenefits}
                  onChange={(e) => setProductBenefits(e.target.value)}
                  className="min-h-[130px] w-full rounded-2xl border bg-white px-4 py-3"
                />
              </div>

              {/* DOSAGE */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Dosage
                </h3>

                <input
                  type="text"
                  placeholder="Enter dosage"
                  value={productDosage}
                  onChange={(e) => setProductDosage(e.target.value)}
                  className="w-full rounded-2xl border bg-white px-4 py-3"
                />
              </div>

              <div className="rounded-2xl border bg-white p-4">
                <label className="mb-3 block text-sm font-medium">
                  Upload Product Images
                </label>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);

                    const uploadedUrls = [];

                    for (const file of files) {
                      const url = await uploadProductImage(file);

                      if (url) {
                        uploadedUrls.push(url);
                      }
                    }

                    setProductImages((prev) => [...prev, ...uploadedUrls]);
                  }}
                />

                <div className="rounded-2xl border bg-white p-4 lg:col-span-2">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Product Variants</h3>

                    <button
                      type="button"
                      onClick={() =>
                        setProductVariants([
                          ...productVariants,

                          {
                            size: "",
                            images: [],
                          },
                        ])
                      }
                      className="rounded-xl bg-primary px-4 py-2 text-sm text-white"
                    >
                      Add Variant
                    </button>
                  </div>

                  <div className="space-y-5">
                    {productVariants.map((variant, variantIndex) => (
                      <div
                        key={variantIndex}
                        className="rounded-2xl border p-4"
                      >
                        <div className="mb-4 flex gap-3">
                          <input
                            type="text"
                            placeholder="Variant Size"
                            value={variant.size}
                            onChange={(e) => {
                              const updated = [...productVariants];

                              updated[variantIndex].size = e.target.value;

                              setProductVariants(updated);
                            }}
                            className="w-full rounded-xl border px-4 py-3"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              const updated = productVariants.filter(
                                (_: any, i: number) => i !== variantIndex,
                              );

                              setProductVariants(updated);
                            }}
                            className="rounded-xl bg-red-500 px-4 text-white"
                          >
                            Remove
                          </button>
                        </div>

                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || []);

                            const uploaded = [];

                            for (const file of files) {
                              const url = await uploadProductImage(file);

                              if (url) {
                                uploaded.push(url);
                              }
                            }

                            const updated = [...productVariants];

                            updated[variantIndex].images = [
                              ...(updated[variantIndex].images || []),

                              ...uploaded,
                            ];

                            setProductVariants(updated);
                          }}
                        />

                        <DndContext
  collisionDetection={closestCenter}
  onDragEnd={(event) =>
    handleVariantImageDragEnd(
      variantIndex,
      event,
    )
  }
>
  <SortableContext
    items={variant.images || []}
    strategy={rectSortingStrategy}
  >
    <div className="mt-4 flex flex-wrap gap-3">
      {variant.images?.map(
        (img: string, i: number) => (
          <SortableImage
            key={img}
            image={img}
            index={i}
            onRemove={() => {
              const updated = [...productVariants];

              updated[variantIndex].images =
                updated[
                  variantIndex
                ].images.filter(
                  (
                    _: string,
                    imgIndex: number,
                  ) => imgIndex !== i,
                );

              setProductVariants(updated);
            }}
          />
        ),
      )}
    </div>
  </SortableContext>
</DndContext>
                      </div>
                    ))}
                  </div>
                </div>

                <DndContext
  collisionDetection={closestCenter}
  onDragEnd={handleImageDragEnd}
>
  <SortableContext
    items={productImages}
    strategy={rectSortingStrategy}
  >
    <div className="mt-4 flex flex-wrap gap-3">
      {productImages.map((img, index) => (
        <SortableImage
          key={img}
          image={img}
          index={index}
          onRemove={() =>
            setProductImages((prev) =>
              prev.filter((_, i) => i !== index)
            )
          }
        />
      ))}
    </div>
  </SortableContext>
</DndContext>
              </div>
            </div>

            {/* ACTION */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={saveProduct}
                className="rounded-2xl bg-primary px-6 py-3 font-medium text-white"
              >
                {editingProduct ? "Update Product" : "Add Product"}
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
              <h3 className="mb-4 text-lg font-semibold">Existing Products</h3>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {productsData.map((product) => (
                  <div
                    key={product.id}
                    className="overflow-hidden rounded-2xl border bg-white shadow-sm"
                  >
                    <div className="relative overflow-hidden bg-[#f8f5ef]">
                      <img
                        src={product.image_urls?.[0] || "/placeholder.webp"}
                        alt=""
                        className="h-56 w-full object-contain p-4 transition duration-300 hover:scale-105"
                      />

                      {/* THUMBNAILS */}
                      {product.image_urls?.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-white/90 px-3 py-2 shadow-lg backdrop-blur">
                          {product.image_urls
                            .slice(0, 4)
                            .map((img: string, i: number) => (
                              <img
                                key={i}
                                src={img}
                                alt=""
                                className="h-10 w-10 rounded-lg border bg-white object-cover"
                              />
                            ))}

                          {product.image_urls.length > 4 && (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white text-xs font-semibold">
                              +{product.image_urls.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold">{product.name}</h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {product.category}
                      </p>

                      <p className="mt-2 line-clamp-2 text-sm">
                        {product.tagline}
                      </p>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);

                            setProductName(product.name);

                            setProductTagline(product.tagline);

                            setProductCategory(product.category);

                            setProductComposition(product.composition);

                            setProductDosage(product.dosage);

                            setProductDescription(product.description);

                            setProductBenefits(product.benefits?.join(","));

                            setProductIndications(
                              product.indications?.join(","),
                            );

                            setProductImages(product.image_urls || []);
                            setProductVariants(product.variants || []);
                          }}
                          className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white"
                        >
                          Edit
                        </button>

                        <button
                          onClick={async () => {
                            const result = await confirmAlert(
                              "Delete Product?",
                              "This cannot be undone",
                            );

                            if (!result.isConfirmed) return;

                            await supabase
                              .from("products")
                              .delete()
                              .eq("id", product.id);

                            successAlert("Product Deleted");

                            fetchProducts();
                          }}
                          className="flex-1 rounded-xl bg-red-500 px-4 py-2 text-sm text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EMPLOYEES */}
        <div className="rounded-2xl border border-white/20 bg-white/60 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Employees</h2>

            <button
              onClick={() => setShowAddEmployee(!showAddEmployee)}
              className="rounded-xl bg-primary px-4 py-2 text-sm text-white"
            >
              {showAddEmployee ? "Close" : "Add Employee"}
            </button>
          </div>

          {showAddEmployee && (
            <div className="mb-5 grid gap-4 rounded-2xl border bg-white p-4 md:grid-cols-2">
              {/* <input
                type="text"
                placeholder="Username"
                value={employeeUsername}
                onChange={(e) => setEmployeeUsername(e.target.value)}
                className="rounded-xl border px-4 py-3"
              /> */}

              <input
                type="text"
                placeholder="Full Name"
                value={employeeFullName}
                onChange={(e) => setEmployeeFullName(e.target.value)}
                className="rounded-xl border px-4 py-3"
              />

              <input
                type="text"
                placeholder="Phone"
                value={employeePhone}
                onChange={(e) => setEmployeePhone(e.target.value)}
                className="rounded-xl border px-4 py-3"
              />

              <input
                type="email"
                placeholder="Google Email"
                value={employeeEmail}
                onChange={(e) => setEmployeeEmail(e.target.value)}
                className="rounded-xl border px-4 py-3"
              />

              <select
                value={employeeRole}
                onChange={(e) => setEmployeeRole(e.target.value)}
                className="rounded-xl border px-4 py-3"
              >
                <option value="employee">Employee</option>

                <option value="admin">Admin</option>
              </select>

              <button
                onClick={addEmployee}
                className="rounded-xl bg-primary px-4 py-3 text-white"
              >
                Save Employee
              </button>
            </div>
          )}

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
                  {/* <th className="p-2.5 text-left text-sm">Username</th> */}

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
                    {/* <td className="p-2.5 text-sm">{emp.username}</td> */}

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

                  <th className="p-2.5 text-left text-sm">Location</th>

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
                          {entry.employee_email || "-"}
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
                    <td>
                      {entry.latitude && entry.longitude ? (
                        <a
                          href={`https://maps.google.com/?q=${entry.latitude},${entry.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          <button
                            onClick={() =>
                              window.open(
                                `https://maps.google.com/?q=${entry.latitude},${entry.longitude}`,
                                "_blank",
                              )
                            }
                          >
                            View Map
                          </button>
                        </a>
                      ) : (
                        "-"
                      )}
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
