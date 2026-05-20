import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Select from "react-select";

import { supabase } from "@/lib/supabase";

import { products } from "@/data/products";

interface RowData {
  id?: number;

  isNew?: boolean;

  date: string;

  doctorName: string;

  product: string[];
}
const productOptions = products.map((product) => ({
  value: product.name,
  label: product.name,
}));

export default function Dashboard() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<RowData[]>([
  {
    isNew: true,
    date: "",
    doctorName: "",
    product: [],
  },
]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (!isLoggedIn) {
      navigate("/login");
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    const employeeId = localStorage.getItem("employeeId");

    const { data, error } = await supabase
      .from("doctor_entries")
      .select("*")
      .eq("employee_id", employeeId)
      .order("id", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    if (data && data.length > 0) {
    const formattedData = data.map(
  (item) => ({
    id: item.id,

    isNew: false,

    date: item.visit_date || "",

    doctorName:
      item.doctor_name || "",

    product: item.products || [],
  })
);

      setRows([
        {
          date: "",
          doctorName: "",
          product: [],
        },
        ...formattedData,
      ]);
    } else {
      setRows([
        {
          date: "",
          doctorName: "",
          product: [],
        },
      ]);
    }
  };

  const handleChange = (
  index: number,
  field: keyof RowData,
  value: string | string[]
) => {
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
      isNew: true,
      date: "",
      doctorName: "",
      product: [],
    },
    ...rows,
  ]);
};

 const deleteRow = async (
  index: number
) => {
  const row = rows[index];

  // If row exists in database
  if (row.id) {
    const { error } = await supabase
      .from("doctor_entries")
      .delete()
      .eq("id", row.id);

    if (error) {
      console.log(error);

      alert("Error deleting row");

      return;
    }
  }

  // Remove from UI
  const updatedRows = rows.filter(
    (_, i) => i !== index
  );

  setRows(updatedRows);

  // Always keep one empty row
  if (updatedRows.length === 0) {
    setRows([
      {
        date: "",
        doctorName: "",
        product: [],
      },
    ]);
  }
};

const saveData = async () => {
  const employeeId =
    localStorage.getItem("employeeId");

  if (!employeeId) {
    alert("Employee not found");
    return;
  }

  // INSERT NEW ROWS
  const newRows = rows.filter(
    (row) =>
      !row.id &&
      row.date &&
      row.doctorName &&
      row.product.length > 0
  );

  if (newRows.length > 0) {
    const { error } = await supabase
      .from("doctor_entries")
      .insert(
        newRows.map((row) => ({
          employee_id:
            Number(employeeId),

          visit_date: row.date,

          doctor_name:
            row.doctorName,

          products: row.product,
        }))
      );

    if (error) {
      console.log(error);

      alert(error.message);

      return;
    }
  }

  // UPDATE EXISTING ROWS
  const existingRows = rows.filter(
    (row) =>
      row.id &&
      row.date &&
      row.doctorName &&
      row.product.length > 0
  );

  for (const row of existingRows) {
    const { error } = await supabase
      .from("doctor_entries")
      .update({
        visit_date: row.date,

        doctor_name:
          row.doctorName,

        products: row.product,
      })
      .eq("id", row.id);

    if (error) {
      console.log(error);

      alert(error.message);

      return;
    }
  }

  // FETCH UPDATED DATA
  const { data, error } = await supabase
    .from("doctor_entries")
    .select("*")
    .eq(
      "employee_id",
      Number(employeeId)
    )
    .order("id", {
      ascending: false,
    });

  if (error) {
    console.log(error);

    alert(error.message);

    return;
  }

  const formattedRows = data.map(
    (item) => ({
      id: item.id,

      date: item.visit_date || "",

      doctorName:
        item.doctor_name || "",

      product: item.products || [],
    })
  );

  // FINAL STATE
  setRows([
    {
      date: "",
      doctorName: "",
      product: [],
    },

    ...formattedRows,
  ]);

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

        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[850px] border-collapse">
            <thead>
              <tr className="bg-secondary">
                <th className="p-4 text-left">Date</th>

                <th className="p-4 text-left">Doctor Name</th>

                <th className="p-4 text-left">Products</th>

                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-t border-border align-top">
                  <td className="p-4">
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) =>
                        handleChange(index, "date", e.target.value)
                      }
                      className="w-full rounded-lg border border-border px-3 py-2"
                    />
                  </td>

                  <td className="p-4">
                    <input
                      type="text"
                      placeholder="Doctor name"
                      value={row.doctorName}
                      onChange={(e) =>
                        handleChange(index, "doctorName", e.target.value)
                      }
                      className="w-full rounded-lg border border-border px-3 py-2"
                    />
                  </td>

                  <td className="p-4 min-w-[320px]">
                    <Select
                      isMulti
                      closeMenuOnSelect={false}
                      hideSelectedOptions={false}
                      options={productOptions}
                      value={productOptions.filter((option) =>
                        row.product.includes(option.value),
                      )}
                      onChange={(selectedOptions) =>
                        handleChange(
                          index,
                          "product",
                          selectedOptions.map((option) => option.value),
                        )
                      }
                      placeholder="Select Products"
                      className="text-sm"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({
                          ...base,
                          zIndex: 9999,
                        }),

                        control: (base) => ({
                          ...base,
                          minHeight: "44px",
                          borderRadius: "10px",
                        }),

                        valueContainer: (base) => ({
                          ...base,
                          maxHeight: "70px",
                          overflowY: "auto",
                          padding: "4px",
                        }),

                        multiValue: (base) => ({
                          ...base,
                          fontSize: "12px",
                        }),

                        menu: (base) => ({
                          ...base,
                          zIndex: 9999,
                        }),
                      }}
                    />
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => deleteRow(index)}
                      className="rounded-lg bg-red-500 px-4 py-2 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        </div>
      </div>
    </div>
  );
}
