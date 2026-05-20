import { useEffect, useState } from "react";

import Select from "react-select";

import { supabase } from "@/lib/supabase";

import { products } from "@/data/products";

import {
  successAlert,
  errorAlert,
  warningAlert,
  confirmAlert,
} from "@/lib/alert";

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

  const [contacts, setContacts] = useState<any[]>([]);

  const [supportsContactPicker, setSupportsContactPicker] = useState(false);

  useEffect(() => {
    setSupportsContactPicker(
      typeof navigator !== "undefined" &&
        !!navigator.contacts &&
        typeof navigator.contacts.select === "function",
    );
  }, []);

  useEffect(() => {
    fetchData();
    loadContacts();
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
      errorAlert(
  "Failed To Load Contacts",
);
    }
  };

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
      errorAlert("Connection Failed", error.message);
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
      errorAlert(
  "Contact Access Failed",
);
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
    const result = await confirmAlert(
      "Delete Entry?",
      "This action cannot be undone",
    );

    if (!result.isConfirmed) return;

    const row = rows[index];

    // DELETE FROM DATABASE
    if (row.id) {
      const { error } = await supabase
        .from("doctor_entries")
        .delete()
        .eq("id", row.id);

      if (error) {
        errorAlert("Delete Failed", error.message);

        return;
      }
    }

    // REMOVE FROM UI
    const updatedRows = rows.filter((_, i) => i !== index);

    setRows(updatedRows);

    successAlert("Deleted Successfully");
  };

  const saveSingleRow = async (row: RowData) => {
    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      errorAlert("Employee Not Found");
      return;
    }

    if (!row.date || !row.doctorName || row.product.length === 0) {
      warningAlert("Incomplete Form", "Please fill all fields");
      return;
    }

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
        errorAlert("Update Failed", error.message);
        return;
      }

      successAlert("Updated Successfully");
    } else {
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
        errorAlert("Add Failed", error.message);
        return;
      }

      successAlert("Added Successfully");
    }

    fetchData();
  };

  return (
    <div className="min-h-screen bg-background px-3 py-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>

            <p className="mt-1 text-muted-foreground">
              Doctor Product Database
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* <button
              onClick={addRow}
              className="rounded-xl bg-secondary px-5 py-3 font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
            >
              + Add Row
            </button> */}

            {!supportsContactPicker && contacts.length === 0 && (
              <button
                onClick={connectGoogle}
                className="rounded-xl border border-border bg-white px-5 py-3 transition-all duration-200 hover:shadow-md"
              >
                Connect Contacts
              </button>
            )}
          </div>
        </div>

        {/* STATS */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Total Entries</p>

            <h2 className="mt-2 text-3xl font-bold">
              {rows.filter((r) => r.id).length}
            </h2>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Products Added</p>

            <h2 className="mt-2 text-3xl font-bold">
              {rows.reduce((acc, row) => acc + row.product.length, 0)}
            </h2>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Contacts Synced</p>

            <h2 className="mt-2 text-3xl font-bold">{contacts.length}</h2>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Today's Date</p>

            <h2 className="mt-2 text-xl font-semibold">{today}</h2>
          </div>
        </div>

        {/* ROWS */}
        <div className="space-y-5">
          {rows.map((row, index) => (
            <div
              key={index}
              className="overflow-visible rounded-3xl border border-border bg-card/90 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
            >
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_2fr]">
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
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Products
                  </label>

                  <Select
                    isMulti
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
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
                        minHeight: 54,
                        borderRadius: 14,
                        borderColor: "#e5e7eb",
                        boxShadow: "none",
                        paddingInline: 4,
                      }),

                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                        borderRadius: 14,
                        overflow: "hidden",
                      }),

                      menuList: (base) => ({
                        ...base,
                        maxHeight: 220,
                      }),

                      multiValue: (base) => ({
                        ...base,
                        borderRadius: 999,
                        paddingInline: 4,
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                  />
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                {supportsContactPicker && (
                  <button
                    type="button"
                    onClick={() => pickPhoneContact(index)}
                    className="rounded-xl border border-border bg-white px-4 py-2 text-sm transition-all duration-200 hover:shadow-md"
                  >
                    Pick Contact
                  </button>
                )}

                <div className="flex flex-wrap gap-2">
                  {!row.id && (
                    <button
                      onClick={() => saveSingleRow(row)}
                      className="rounded-xl bg-primary px-5 py-2.5 text-sm text-white transition-all duration-200 hover:scale-[1.02]"
                    >
                      Add Data
                    </button>
                  )}

                  {row.id && (
                    <>
                      <button
                        onClick={() => saveSingleRow(row)}
                        className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm text-white transition-all duration-200 hover:scale-[1.02]"
                      >
                        Update Data
                      </button>

                      <button
                        onClick={() => deleteRow(index)}
                        className="rounded-xl bg-red-500 px-5 py-2.5 text-sm text-white transition-all duration-200 hover:scale-[1.02]"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
