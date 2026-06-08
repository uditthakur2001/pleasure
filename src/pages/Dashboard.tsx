import { useEffect, useState } from "react";

import Select from "react-select";

import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";

import { products } from "@/data/products";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

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
  const [saving, setSaving] = useState(false);
  const [supportsContactPicker, setSupportsContactPicker] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [sales, setSales] = useState("");
  const [collections, setCollections] = useState("");

  useEffect(() => {
    setSupportsContactPicker(
      typeof navigator !== "undefined" &&
        !!navigator.contacts &&
        typeof navigator.contacts.select === "function",
    );
  }, []);

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/";
      return;
    }

    localStorage.setItem("isLoggedIn", "true");

    localStorage.setItem("employeeName", user.user_metadata?.full_name || "");

    localStorage.setItem("employeeEmail", user.email || "");

    localStorage.setItem("employeeId", user.id);

    await fetchData(user.id);

    await loadContacts();
  };

  const createCalendarEvent = async (
    doctorName: string,
    doctorPhone: string,
    products: string[],
    startDate: string,
  ) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken = session?.provider_token;

      if (!accessToken) {
        console.log("No Google token");

        return;
      }

      // START DATE
      let reminderDate = new Date(startDate);

      let addedDays = 0;

      // FIND 13TH WORKING DAY
      while (addedDays < 13) {
        reminderDate.setDate(reminderDate.getDate() + 1);

        // SKIP SUNDAY
        if (reminderDate.getDay() !== 0) {
          addedDays++;
        }
      }

      const finalDate = reminderDate.toISOString().split("T")[0];

      // CREATE GOOGLE CALENDAR EVENT
      await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${accessToken}`,

            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            summary: `Doctor Follow-up - ${doctorName}`,

            description: `
            Doctor Name: ${doctorName}

            Doctor Phone: ${doctorPhone}

            Products: ${products.join(", ")}

            Employee: ${localStorage.getItem("employeeName")} `,

            start: {
              date: finalDate,
            },

            end: {
              date: finalDate,
            },
          }),
        },
      );
    } catch (err) {
      console.log(err);
    }
  };

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
      errorAlert("Failed To Load Contacts");
    }
  };

  const fetchData = async (employeeId?: string) => {
    const userId = employeeId || localStorage.getItem("employeeId");

    if (!userId) return;

    const { data, error } = await supabase
      .from("doctor_entries")
      .select("*")
      .eq("employee_id", userId)
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
        scopes:
          "openid email profile https://www.googleapis.com/auth/contacts.readonly https://www.googleapis.com/auth/calendar",

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
      errorAlert("Contact Access Failed");
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

  const saveSingleRow = async (row: RowData) => {
    if (saving) return;
    setSaving(true);

    const currentHour = new Date().getHours();

    // Block from 9 PM (21) to 6 AM (6)
    if (currentHour >= 21 || currentHour < 6) {
      setSaving(false);

      warningAlert(
        "Entry Not Allowed",
        "Doctor visits can only be added between 6:00 AM and 9:00 PM.",
      );

      return;
    }

    Swal.fire({
      title: "Saving Doctor Visit",
      html: `
    <div style="display:flex;flex-direction:column;align-items:center;gap:14px;">
      
      <div style="
        width:70px;
        height:70px;
        border:4px solid #e5e7eb;
        border-top:4px solid #22c55e;
        border-radius:50%;
        animation:spin 1s linear infinite;
      "></div>

      <div style="
        font-size:15px;
        color:#6b7280;
      ">
        Please wait...
      </div>

      <div style="
        font-size:32px;
        font-weight:700;
        color:#16a34a;
      ">
        <span id="countdown">5</span>s
      </div>

    </div>

    <style>
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    </style>
  `,
      timer: 5000,
      timerProgressBar: false, // removes bottom line
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,

      didOpen: () => {
        const countdown = Swal.getHtmlContainer()?.querySelector("#countdown");

        const interval = setInterval(() => {
          const timeLeft = Swal.getTimerLeft();

          if (countdown && timeLeft !== undefined) {
            countdown.textContent = Math.ceil(timeLeft / 1000).toString();
          }
        }, 100);

        Swal.getPopup()?.addEventListener("close", () => {
          clearInterval(interval);
        });
      },

      customClass: {
        popup: "rounded-3xl shadow-2xl",
      },
    });

    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      errorAlert("Employee Not Found");
      return;
    }

    if (
      !row.date ||
      !row.doctorName.trim() ||
      !row.doctorPhone.trim() ||
      row.product.length === 0
    ) {
      warningAlert(
        "Incomplete Form",
        "Doctor name, phone number and products are required",
      );

      return;
    }

    // VALID DOCTOR NAME
    const doctorNameRegex = /^[A-Za-z\s.]+$/;

    if (!doctorNameRegex.test(row.doctorName.trim())) {
      warningAlert(
        "Invalid Doctor Name",
        "Doctor name should contain only letters",
      );

      return;
    }

    // VALID PHONE NUMBER
    const cleanPhone = row.doctorPhone.replace(/\D/g, "");

    // VALID INDIAN MOBILE NUMBER
    const indianPhoneRegex = /^(91)?[6-9]\d{9}$/;
    if (!indianPhoneRegex.test(cleanPhone)) {
      warningAlert(
        "Invalid Phone Number",
        "Enter valid 10-digit Indian mobile number",
      );

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
      let latitude = null;
      let longitude = null;

      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 5000,
              maximumAge: 60000,
            });
          },
        );

        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch (err) {
        errorAlert(
          "Location Required",
          "Please allow location access before saving.",
        );
        return;
      }

      const { error } = await supabase.from("doctor_entries").insert([
        {
          employee_id: employeeId,
          visit_date: row.date,
          doctor_name: row.doctorName,
          doctor_phone: row.doctorPhone,
          products: row.product,
          latitude,
          longitude,
        },
      ]);

      if (error) {
        errorAlert("Add Failed", error.message);
        return;
      }

      await createCalendarEvent(
        row.doctorName,
        row.doctorPhone,
        row.product,
        row.date,
      );

      successAlert("Added Successfully");
    }
    setSaving(false);
    fetchData();
  };

  const visitDates = rows.filter((row) => row.id).map((row) => row.date);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const filteredRows = rows.filter((row) => {
    if (!row.id) return false;

    const rowDate = formatDate(new Date(row.date));

    const selectedDateString = formatDate(selectedDate);

    return rowDate === selectedDateString;
  });

  const saveSalesCollection = async () => {
    try {
      const authId = localStorage.getItem("employeeId");

      const { data: employee, error: employeeError } = await supabase
        .from("employee")
        .select("id")
        .eq("google_id", authId)
        .single();

      if (employeeError || !employee) {
        errorAlert("Employee Not Found");
        return;
      }

      if (!sales && !collections) {
        warningAlert("Enter Value", "Please enter Sales or Collection amount");
        return;
      }
      const { error } = await supabase.from("employee_sales").insert([
        {
          employee_id: employee.id,
          sales: Number(sales || 0),
          collection: Number(collections || 0),
          report_date: today,
        },
      ]);

      if (error) {
        errorAlert("Failed", error.message);
        return;
      }

      successAlert("Saved Successfully");
    } catch (err) {
      console.log(err);
    }
    setSales("");
    setCollections("");

    await fetchDailySales(selectedDate);
  };

  const [dailySales, setDailySales] = useState(0);
  const [dailyCollection, setDailyCollection] = useState(0);

  const fetchDailySales = async (date: Date) => {
    try {
      const authId = localStorage.getItem("employeeId");

      if (!authId) return;

      const { data: employee, error: employeeError } = await supabase
        .from("employee")
        .select("id")
        .eq("google_id", authId)
        .single();

      if (employeeError || !employee) {
        console.log("Employee not found");
        return;
      }

      const formattedDate = formatDate(date);

      const { data, error } = await supabase
        .from("employee_sales")
        .select("*")
        .eq("employee_id", employee.id)
        .eq("report_date", formattedDate);

      if (error) {
        console.log(error);
        return;
      }

      const totalSales =
        data?.reduce((sum, row) => sum + Number(row.sales || 0), 0) || 0;

      const totalCollection =
        data?.reduce((sum, row) => sum + Number(row.collection || 0), 0) || 0;

      setDailySales(totalSales);
      setDailyCollection(totalCollection);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchDailySales(selectedDate);
  }, [selectedDate]);

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
        {/* <div className="grid gap-6 lg:grid-cols-12 mb-6 "> */}
        <div className="grid gap-4 mb-6">
          <div>
            <div>
              {rows
                .filter((row) => !row.id)
                .map((row, index) => (
                  <div
                    key={index}
                    className="overflow-visible rounded-3xl border border-border bg-card/90 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                  >
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Doctor Visit
                    </div>
                    <div className="grid items-end gap-4 xl:grid-cols-[1.4fr_1.4fr_3fr_4fr]">
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
                          disabled={!!row.id}
                          autoCapitalize="words"
                          autoComplete="off"
                          spellCheck={false}
                          onChange={(e) => {
                            // REMOVE NUMBERS & SPECIAL CHARS
                            const cleaned = e.target.value
                              .replace(/[^A-Za-z\s.]/g, "")
                              .replace(/\b\w/g, (char) => char.toUpperCase());

                            handleChange(index, "doctorName", cleaned);
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
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={15}
                          placeholder="Phone number"
                          value={row.doctorPhone}
                          disabled={!!row.id}
                          onChange={(e) => {
                            const onlyNumbers = e.target.value.replace(
                              /\D/g,
                              "",
                            );

                            handleChange(index, "doctorPhone", onlyNumbers);
                          }}
                          className="w-full rounded-xl border border-border px-4 py-3"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Products
                        </label>

                        <div className="flex items-end gap-3">
                          <div className="flex-1">
                            <Select
                              isMulti
                              isDisabled={!!row.id}
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
                                }),
                              }}
                            />
                          </div>

                          {!row.id && (
                            <button
                              onClick={() => saveSingleRow(row)}
                              className="h-[56px] whitespace-nowrap rounded-xl bg-primary px-6 text-white"
                            >
                              Add Data
                            </button>
                          )}
                        </div>
                        {/* </div> */}
                      </div>
                      <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Daily Reporting
                        </div>

                        <div className="flex items-end gap-3">
                          <div className="flex-1">
                            <label className="mb-1 block text-sm font-medium">
                              Sales
                            </label>

                            <input
                              type="number"
                              value={sales}
                              onChange={(e) => setSales(e.target.value)}
                              placeholder="Sales"
                              className="h-[56px] w-full rounded-xl border px-4"
                            />
                          </div>

                          <div className="flex-1">
                            <label className="mb-1 block text-sm font-medium">
                              Collection
                            </label>

                            <input
                              type="number"
                              value={collections}
                              onChange={(e) => setCollections(e.target.value)}
                              placeholder="Collection"
                              className="h-[56px] w-full rounded-xl border px-4"
                            />
                          </div>

                          <button
                            onClick={saveSalesCollection}
                            className="h-[56px] w-[56px] shrink-0 rounded-xl bg-green-600 text-xl text-white"
                          >
                            ✓
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {supportsContactPicker && (
                        <button
                          type="button"
                          onClick={() => pickPhoneContact(index)}
                          className="rounded-xl border border-border bg-white px-4 py-2 text-sm transition-all duration-200 hover:shadow-md"
                        >
                          Pick Contact
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12 mt-4">
          <div className="lg:col-span-4">
            <div className="h-full rounded-3xl border border-gray-100 bg-gradient-to-br from-white to-green-50 p-6 shadow-lg">
              <div className="mb-6 flex items-center gap-3">
                <div>
                  <h2 className="text-xl font-bold">Visit Calendar</h2>

                  <p className="text-sm text-gray-500">
                    Track your doctor visits
                  </p>
                </div>
              </div>
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) setSelectedDate(date);
                }}
                modifiers={{
                  visited: (date) => {
                    const formatted = formatDate(date);
                    return visitDates.includes(formatted);
                  },
                }}
                modifiersClassNames={{
                  visited: "visit-day",
                }}
                components={{
                  DayContent: ({ date }) => {
                    const hasVisit = visitDates.includes(formatDate(date));

                    return (
                      <div className="relative flex h-full w-full items-center justify-center">
                        {date.getDate()}

                        {hasVisit && (
                          <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-green-600" />
                        )}
                      </div>
                    );
                  },
                }}
              />

              <div className="mt-6 rounded-2xl bg-green-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Selected Date
                </p>

                <p className="mt-1 text-lg font-bold text-green-700">
                  {selectedDate.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="h-full rounded-3xl border border-gray-100 bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Doctor Visits</h2>

                <span className="rounded-full bg-green-50 px-3 py-1 text-sm text-green-700">
                  {filteredRows.length} Entries
                </span>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-green-50 p-4 border">
                  <p className="text-sm text-gray-500">Today's Sales</p>

                  <h3 className="mt-2 text-2xl font-bold text-green-700">
                    ₹{dailySales.toLocaleString()}
                  </h3>
                </div>

                <div className="rounded-2xl bg-blue-50 p-4 border">
                  <p className="text-sm text-gray-500">Today's Collection</p>

                  <h3 className="mt-2 text-2xl font-bold text-blue-700">
                    ₹{dailyCollection.toLocaleString()}
                  </h3>
                </div>
              </div>

              {filteredRows.length === 0 ? (
                <div className="py-10 text-center text-gray-500">
                  No visits found for this date
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRows.map((row) => (
                    <div key={row.id} className="rounded-2xl border p-4">
                      <div className="font-semibold">{row.doctorName}</div>

                      <div className="mt-2 text-sm text-gray-500">
                        {row.doctorPhone}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {row.product?.map((product: string) => (
                          <span
                            key={product}
                            className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                          >
                            {product}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
