import { useEffect, useState } from "react";

import Select from "react-select";

import { gapi } from "gapi-script";

import { supabase } from "@/lib/supabase";

import { products } from "@/data/products";

interface RowData {
  id?: number;

  date: string;

  doctorName: string;

  doctorPhone: string;

  product: string[];
}

const productOptions = products.map(
  (product) => ({
    value: product.name,
    label: product.name,
  })
);

export default function Dashboard() {
  const [rows, setRows] = useState<
    RowData[]
  >([
    {
      date: "",

      doctorName: "",

      doctorPhone: "",

      product: [],
    },
  ]);

  const [contacts, setContacts] =
    useState<any[]>([]);

  useEffect(() => {
    fetchData();

    const initClient = () => {
      gapi.load(
        "client:auth2",
        async () => {
          await gapi.client.init({
            clientId:
              import.meta.env
                .VITE_GOOGLE_CLIENT_ID,

            scope:
              "https://www.googleapis.com/auth/contacts.readonly",
          });
        }
      );
    };

    initClient();
  }, []);

  const fetchData = async () => {
    const employeeId =
      localStorage.getItem(
        "employeeId"
      );

    if (!employeeId) return;

    const { data, error } =
      await supabase
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
      return;
    }

    const formattedRows =
      data.map((item) => ({
        id: item.id,

        date:
          item.visit_date || "",

        doctorName:
          item.doctor_name || "",

        doctorPhone:
          item.doctor_phone || "",

        product:
          item.products || [],
      }));

    setRows([
      {
        date: "",

        doctorName: "",

        doctorPhone: "",

        product: [],
      },

      ...formattedRows,
    ]);
  };

  const connectGoogle =
    async () => {
      const authInstance =
        gapi.auth2.getAuthInstance();

      await authInstance.signIn();

      const response =
        await gapi.client.request({
          path:
            "https://people.googleapis.com/v1/people/me/connections",

          params: {
            personFields:
              "names,phoneNumbers",
          },
        });

      const connections =
        response.result
          .connections || [];

      const formattedContacts =
        connections.map(
          (c: any) => ({
            name:
              c.names?.[0]
                ?.displayName ||
              "",

            phone:
              c.phoneNumbers?.[0]
                ?.value || "",
          })
        );

      setContacts(
        formattedContacts
      );

      alert(
        "Google Contacts Connected"
      );
    };

  const handleChange = (
    index: number,
    field: keyof RowData,
    value: any
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
        date: "",

        doctorName: "",

        doctorPhone: "",

        product: [],
      },

      ...rows,
    ]);
  };

  const deleteRow = async (
    index: number
  ) => {
    const row = rows[index];

    if (row.id) {
      const { error } =
        await supabase
          .from("doctor_entries")
          .delete()
          .eq("id", row.id);

      if (error) {
        alert(
          "Error deleting row"
        );

        return;
      }
    }

    const updatedRows =
      rows.filter(
        (_, i) => i !== index
      );

    setRows(updatedRows);
  };

  const saveData = async () => {
    const employeeId =
      localStorage.getItem(
        "employeeId"
      );

    if (!employeeId) {
      alert(
        "Employee not found"
      );

      return;
    }

    const newRows = rows.filter(
      (row) =>
        !row.id &&
        row.date &&
        row.doctorName &&
        row.product.length > 0
    );

    if (newRows.length > 0) {
      const { error } =
        await supabase
          .from("doctor_entries")
          .insert(
            newRows.map((row) => ({
              employee_id:
                Number(
                  employeeId
                ),

              visit_date:
                row.date,

              doctor_name:
                row.doctorName,

              doctor_phone:
                row.doctorPhone,

              products:
                row.product,
            }))
          );

      if (error) {
        console.log(error);

        alert(error.message);

        return;
      }
    }

    const existingRows =
      rows.filter(
        (row) =>
          row.id &&
          row.date &&
          row.doctorName &&
          row.product.length > 0
      );

    for (const row of existingRows) {
      const { error } =
        await supabase
          .from("doctor_entries")
          .update({
            visit_date:
              row.date,

            doctor_name:
              row.doctorName,

            doctor_phone:
              row.doctorPhone,

            products:
              row.product,
          })
          .eq("id", row.id);

      if (error) {
        console.log(error);

        alert(error.message);

        return;
      }
    }

    await fetchData();

    alert(
      "Data saved successfully"
    );
  };

  return (
    <div className="min-h-screen bg-background px-3 py-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Dashboard
            </h1>

            <p className="text-muted-foreground">
              Doctor Product Database
            </p>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-3">
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
            onClick={
              connectGoogle
            }
            className="rounded-lg border border-border px-5 py-3"
          >
            Connect Contacts
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[1100px] border-collapse">
            <thead>
              <tr className="bg-secondary">
                <th className="p-4 text-left">
                  Date
                </th>

                <th className="p-4 text-left">
                  Doctor
                </th>

                <th className="p-4 text-left">
                  Phone
                </th>

                <th className="p-4 text-left">
                  Products
                </th>

                <th className="p-4 text-left">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map(
                (row, index) => (
                  <tr
                    key={index}
                    className="border-t border-border align-top"
                  >
                    <td className="p-4">
                      <input
                        type="date"
                        value={row.date}
                        onChange={(
                          e
                        ) =>
                          handleChange(
                            index,
                            "date",
                            e.target
                              .value
                          )
                        }
                        className="w-full rounded-lg border border-border px-3 py-2"
                      />
                    </td>

                    <td className="p-4">
                      <input
                        list={`doctor-list-${index}`}
                        type="text"
                        placeholder="Doctor name"
                        value={
                          row.doctorName
                        }
                        onChange={(
                          e
                        ) => {
                          const value =
                            e.target
                              .value;

                          handleChange(
                            index,
                            "doctorName",
                            value
                          );

                          const matched =
                            contacts.find(
                              (
                                c
                              ) =>
                                c.name ===
                                value
                            );

                          if (
                            matched
                          ) {
                            handleChange(
                              index,
                              "doctorPhone",
                              matched.phone
                            );
                          }
                        }}
                        className="w-full rounded-lg border border-border px-3 py-2"
                      />

                      <datalist
                        id={`doctor-list-${index}`}
                      >
                        {contacts.map(
                          (
                            contact,
                            i
                          ) => (
                            <option
                              key={
                                i
                              }
                              value={
                                contact.name
                              }
                            />
                          )
                        )}
                      </datalist>
                    </td>

                    <td className="p-4">
                      <input
                        type="text"
                        placeholder="Phone"
                        value={
                          row.doctorPhone
                        }
                        onChange={(
                          e
                        ) =>
                          handleChange(
                            index,
                            "doctorPhone",
                            e.target
                              .value
                          )
                        }
                        className="w-full rounded-lg border border-border px-3 py-2"
                      />
                    </td>

                    <td className="min-w-[350px] p-4">
                      <Select
                        isMulti
                        closeMenuOnSelect={
                          false
                        }
                        options={
                          productOptions
                        }
                        value={productOptions.filter(
                          (
                            option
                          ) =>
                            row.product.includes(
                              option.value
                            )
                        )}
                        onChange={(
                          selected
                        ) =>
                          handleChange(
                            index,
                            "product",
                            selected.map(
                              (
                                item
                              ) =>
                                item.value
                            )
                          )
                        }
                      />
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() =>
                          deleteRow(
                            index
                          )
                        }
                        className="rounded-lg bg-red-500 px-4 py-2 text-white"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}