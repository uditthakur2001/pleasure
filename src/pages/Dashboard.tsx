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

  useEffect(() => {
    fetchData();
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
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,

      scope: "https://www.googleapis.com/auth/contacts.readonly",

      callback: async (response: any) => {
        if (response.error) {
          console.log(response);

          alert("Google login failed");

          return;
        }

        try {
          const res = await fetch(
            "https://people.googleapis.com/v1/people/me/connections?personFields=names,phoneNumbers&pageSize=1000",
            {
              headers: {
                Authorization: `Bearer ${response.access_token}`,
              },
            },
          );

          const data = await res.json();

          console.log(data);

          const formattedContacts = (data.connections || [])
            .filter((contact: any) => contact.names && contact.phoneNumbers)
            .map((contact: any) => ({
              name: contact.names?.[0]?.displayName || "",

              phone: contact.phoneNumbers?.[0]?.value || "",
            }));

          setContacts(formattedContacts);

          alert(`${formattedContacts.length} contacts synced`);
        } catch (err) {
          console.log(err);

          alert("Failed to fetch contacts");
        }
      },
    });

    client.requestAccessToken();
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

  return (
    <div className="min-h-screen bg-background px-3 py-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <p className="text-muted-foreground">Doctor Product Database</p>
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
          <label className="mb-2 block text-sm font-medium">
            Date
          </label>

          <input
            type="date"
            value={row.date}
            min={today}
            max={today}
            onChange={(e) =>
              handleChange(
                index,
                "date",
                e.target.value
              )
            }
            className="w-full rounded-xl border border-border px-4 py-3"
          />
        </div>

        {/* DOCTOR */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Doctor Name
          </label>

          <input
            list={`doctor-list-${index}`}
            type="text"
            placeholder="Doctor name"
            value={row.doctorName}
            onChange={(e) => {
              const value =
                e.target.value;

              handleChange(
                index,
                "doctorName",
                value
              );

              const matched =
                contacts.find(
                  (c) =>
                    c.name === value
                );

              if (matched) {
                handleChange(
                  index,
                  "doctorPhone",
                  matched.phone
                );
              }
            }}
            className="w-full rounded-xl border border-border px-4 py-3"
          />

          <datalist
            id={`doctor-list-${index}`}
          >
            {contacts.map(
              (contact, i) => (
                <option
                  key={i}
                  value={
                    contact.name
                  }
                />
              )
            )}
          </datalist>
        </div>

        {/* PHONE */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Phone
          </label>

          <input
            type="text"
            placeholder="Phone number"
            value={row.doctorPhone}
            onChange={(e) =>
              handleChange(
                index,
                "doctorPhone",
                e.target.value
              )
            }
            className="w-full rounded-xl border border-border px-4 py-3"
          />
        </div>

        {/* PRODUCTS */}
        <div className="xl:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            Products
          </label>

          <Select
            isMulti
            options={productOptions}
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            menuPlacement="auto"
            value={productOptions.filter(
              (option) =>
                row.product.includes(
                  option.value
                )
            )}
            onChange={(selected) =>
              handleChange(
                index,
                "product",
                selected.map(
                  (item) =>
                    item.value
                )
              )
            }
            styles={{
              control: (
                base
              ) => ({
                ...base,
                minHeight: 52,
                borderRadius: 14,
              }),

              menu: (
                base
              ) => ({
                ...base,
                zIndex: 9999,
              }),

              menuList: (
                base
              ) => ({
                ...base,
                maxHeight: 220,
              }),
            }}
          />
        </div>
      </div>

      {/* DELETE BUTTON */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() =>
            deleteRow(index)
          }
          className="rounded-xl bg-red-500 px-5 py-3 text-white"
        >
          Delete
        </button>
      </div>
    </div>
  ))}
</div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={addRow}
            className="rounded-lg bg-secondary px-5 py-3 font-medium"
          >
            + Add Row
          </button>

          <button
            onClick={saveData}
            className="rounded-lg bg-primary px-5 py-3 text-white"
          >
            Save Data
          </button>

          <button
            onClick={connectGoogle}
            className="rounded-lg border border-border px-5 py-3"
          >
            Connect Contacts
          </button>
        </div>
      </div>
    </div>
  );
}
