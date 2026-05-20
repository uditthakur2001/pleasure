import { useEffect, useState } from "react";

import Select from "react-select";

import { supabase } from "@/lib/supabase";

import { products } from "@/data/products";

interface RowData {
  id?: number;

  date: string;

  doctorName: string;

  doctorPhone: string;

  product: string[];
}

declare global {
  interface Navigator {
    contacts?: {
      select: (
        properties: string[],
        options?: {
          multiple?: boolean;
        },
      ) => Promise<any[]>;
    };
  }
}

const supportsContactPicker = !!navigator.contacts;

const today = new Date().toISOString().split("T")[0];

const productOptions = products.map((product) => ({
  value: product.name,
  label: product.name,
}));

export default function Dashboard() {
  const [rows, setRows] = useState<RowData[]>([
    {
      date: today,

      doctorName: "",

      doctorPhone: "",

      product: [],
    },
  ]);

  const [supportsContactPicker, setSupportsContactPicker] = useState(false);

  useEffect(() => {
    setSupportsContactPicker(!!navigator.contacts);
  }, []);

  const loadContacts = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token = session?.provider_token;

    if (!token) return;

    try {
      const res = await fetch(
        "https://people.googleapis.com/v1/people/me/connections?personFields=names,phoneNumbers&pageSize=1000",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      const formattedContacts = (data.connections || [])
        .filter((contact: any) => contact.names && contact.phoneNumbers)
        .map((contact: any) => ({
          name: contact.names?.[0]?.displayName || "",

          phone: contact.phoneNumbers?.[0]?.value || "",
        }));

      setContacts(formattedContacts);
    } catch (err) {
      console.log(err);
    }
  };

  const [contacts, setContacts] = useState<any[]>([]);
  useEffect(() => {
    fetchData();
    loadContacts();
  }, []);

  const fetchData = async () => {
    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) return;

    const { data, error } = await supabase
      .from("doctor_entries")
      .select("*")
      .eq("employee_id", Number(employeeId))
      .order("id", {
        ascending: false,
      });

    if (error) {
      console.log(error);
      return;
    }

    const formattedRows = data.map((item) => ({
      id: item.id,

      date: item.visit_date || "",

      doctorName: item.doctor_name || "",

      doctorPhone: item.doctor_phone || "",

      product: item.products || [],
    }));

    setRows([
      {
        date: today,

        doctorName: "",

        doctorPhone: "",

        product: [],
      },

      ...formattedRows,
    ]);
  };
  const connectGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",

      options: {
        scopes: "https://www.googleapis.com/auth/contacts.readonly",

        redirectTo: window.location.origin + "/dashboard",
      },
    });

    if (error) {
      alert(error.message);
    }
  };

  const pickPhoneContact = async (index: number) => {
    try {
      // @ts-ignore
      const contacts = await navigator.contacts.select(["name", "tel"], {
        multiple: false,
      });

      if (contacts.length > 0) {
        handleChange(index, "doctorName", contacts[0].name?.[0] || "");

        handleChange(index, "doctorPhone", contacts[0].tel?.[0] || "");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (index: number, field: keyof RowData, value: any) => {
    const updatedRows = [...rows];

    updatedRows[index] = {
      ...updatedRows[index],

      [field]: value,
    };

    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([
      {
        date: today,

        doctorName: "",

        doctorPhone: "",

        product: [],
      },

      ...rows,
    ]);
  };

  const deleteRow = async (index: number) => {
    const row = rows[index];

    if (row.id) {
      const { error } = await supabase
        .from("doctor_entries")
        .delete()
        .eq("id", row.id);

      if (error) {
        alert("Error deleting row");

        return;
      }
    }

    const updatedRows = rows.filter((_, i) => i !== index);

    setRows(updatedRows);
  };

  const saveData = async () => {
    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      alert("Employee not found");

      return;
    }

    const newRows = rows.filter(
      (row) => !row.id && row.date && row.doctorName && row.product.length > 0,
    );

    if (newRows.length > 0) {
      const { error } = await supabase.from("doctor_entries").insert(
        newRows.map((row) => ({
          employee_id: Number(employeeId),

          visit_date: row.date,

          doctor_name: row.doctorName,

          doctor_phone: row.doctorPhone,

          products: row.product,
        })),
      );

      if (error) {
        console.log(error);

        alert(error.message);

        return;
      }
    }

    const existingRows = rows.filter(
      (row) => row.id && row.date && row.doctorName && row.product.length > 0,
    );

    for (const row of existingRows) {
      const { error } = await supabase
        .from("doctor_entries")
        .update({
          visit_date: row.date,

          doctor_name: row.doctorName,

          doctor_phone: row.doctorPhone,

          products: row.product,
        })
        .eq("id", row.id);

      if (error) {
        console.log(error);

        alert(error.message);

        return;
      }
    }

    await fetchData();

    alert("Data saved successfully");
  };

  const saveSingleRow = async (row: RowData) => {
    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      alert("Employee not found");
      return;
    }

    if (!row.date || !row.doctorName || row.product.length === 0) {
      alert("Please fill all fields");

      return;
    }

    // UPDATE
    if (row.id) {
      const { error } = await supabase
        .from("doctor_entries")
        .update({
          visit_date: row.date,

          doctor_name: row.doctorName,

          doctor_phone: row.doctorPhone,

          products: row.product,
        })
        .eq("id", row.id);

      if (error) {
        alert(error.message);
        return;
      }

      alert("Updated");
    }

    // INSERT
    else {
      const { error } = await supabase.from("doctor_entries").insert([
        {
          employee_id: Number(employeeId),

          visit_date: row.date,

          doctor_name: row.doctorName,

          doctor_phone: row.doctorPhone,

          products: row.product,
        },
      ]);

      if (error) {
        alert(error.message);
        return;
      }

      alert("Added");
    }

    fetchData();
  };

  return (
    <div className="min-h-screen bg-background px-3 py-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <p className="text-muted-foreground">Doctor Product Database</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={addRow}
              className="rounded-lg bg-secondary px-5 py-3 font-medium"
            >
              + Add Row
            </button>

            {!supportsContactPicker && contacts.length === 0 && (
              <button
                onClick={connectGoogle}
                className="rounded-lg border border-border px-5 py-3"
              >
                Connect Contacts
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {rows.map((row, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {/* DATE */}
                <div>
                  <label className="mb-1 block text-sm font-medium">Date</label>

                  <input
                    type="date"
                    value={row.date}
                    min={today}
                    max={today}
                    onChange={(e) =>
                      handleChange(index, "date", e.target.value)
                    }
                    className="w-full rounded-xl border border-border px-4 py-3"
                  />
                </div>

                {/* DOCTOR */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Doctor Name
                  </label>

                  <input
                    list={`doctor-list-${index}`}
                    type="text"
                    placeholder="Doctor name"
                    value={row.doctorName}
                    autoCapitalize="words"
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\b\w/g, (char) =>
                        char.toUpperCase(),
                      );

                      handleChange(index, "doctorName", value);
                    }}
                    onBlur={() => {
                      const matched = contacts.find(
                        (c) => c.name === row.doctorName,
                      );

                      if (matched) {
                        handleChange(index, "doctorPhone", matched.phone);
                      }
                    }}
                    className="w-full rounded-xl border border-border px-4 py-3"
                  />

                  <datalist id={`doctor-list-${index}`}>
                    {contacts.map((contact, i) => (
                      <option key={i} value={contact.name} />
                    ))}
                  </datalist>
                </div>

                {/* PHONE */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Phone
                  </label>

                  <input
                    type="text"
                    placeholder="Phone number"
                    value={row.doctorPhone}
                    onChange={(e) =>
                      handleChange(index, "doctorPhone", e.target.value)
                    }
                    className="w-full rounded-xl border border-border px-4 py-3"
                  />
                </div>

                {/* PRODUCTS */}
                <div className="xl:col-span-2">
                  <label className="mb-1 block text-sm font-medium">
                    Products
                  </label>

                  <Select
                    isMulti
                    options={productOptions}
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    menuPlacement="auto"
                    value={productOptions.filter((option) =>
                      row.product.includes(option.value),
                    )}
                    onChange={(selected) =>
                      handleChange(
                        index,
                        "product",
                        selected.map((item) => item.value),
                      )
                    }
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: 42,
                        borderRadius: 10,
                      }),

                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),

                      menuList: (base) => ({
                        ...base,
                        maxHeight: 220,
                      }),
                    }}
                  />
                </div>
              </div>
              {supportsContactPicker && (
                <button
                  type="button"
                  onClick={() => pickPhoneContact(index)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
                >
                  Pick Contact
                </button>
              )}
              <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                {!row.id && (
                  <button
                    onClick={() => saveSingleRow(row)}
                    className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
                  >
                    Add Data
                  </button>
                )}

                {row.id && (
                  <button
                    onClick={() => saveSingleRow(row)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
                  >
                    Update Data
                  </button>
                )}

                <button
                  onClick={() => deleteRow(index)}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
