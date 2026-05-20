import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabase";

import {
  successAlert,
  errorAlert,
  warningAlert,
} from "@/lib/alert";

export default function Signup() {
  const navigate =
    useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [fullName, setFullName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const handleSignup = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const trimmedUsername =
      username
        .trim()
        .toLowerCase();

    const trimmedFullName =
      fullName.trim();

    const trimmedPhone =
      phone.trim();

    const trimmedEmail =
      email
        .trim()
        .toLowerCase();

    // FULL NAME VALIDATION
    if (
      !/^[A-Za-z ]{3,50}$/.test(
        trimmedFullName,
      )
    ) {
      warningAlert(
        "Invalid Full Name",
        "Name should contain only letters and spaces",
      );

      return;
    }

    // PHONE VALIDATION
    if (
      !/^[6-9]\d{9}$/.test(
        trimmedPhone,
      )
    ) {
      warningAlert(
        "Invalid Phone Number",
        "Enter valid 10 digit Indian mobile number",
      );

      return;
    }

    // EMAIL VALIDATION
    if (
      trimmedEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        trimmedEmail,
      )
    ) {
      warningAlert(
        "Invalid Email",
        "Enter valid email address",
      );

      return;
    }

    // USERNAME VALIDATION
    if (
      !/^[a-zA-Z0-9_]{4,20}$/.test(
        trimmedUsername,
      )
    ) {
      warningAlert(
        "Invalid Username",
        "Username must be 4-20 characters without spaces",
      );

      return;
    }

    // PASSWORD VALIDATION
    if (
      password.length < 6
    ) {
      warningAlert(
        "Weak Password",
        "Password must be at least 6 characters",
      );

      return;
    }

    setLoading(true);

    // CHECK UNIQUE USERNAME
    const {
      data: existingUser,
    } = await supabase
      .from("employee")
      .select("id")
      .eq(
        "username",
        trimmedUsername,
      )
      .maybeSingle();

    if (existingUser) {
      setLoading(false);

      warningAlert(
        "Username Exists",
        "Try another username",
      );

      return;
    }

    // CHECK UNIQUE PHONE
    const {
      data: existingPhone,
    } = await supabase
      .from("employee")
      .select("id")
      .eq(
        "phone",
        trimmedPhone,
      )
      .maybeSingle();

    if (existingPhone) {
      setLoading(false);

      warningAlert(
        "Phone Already Exists",
        "Try another phone number",
      );

      return;
    }

    // CHECK UNIQUE EMAIL
    if (trimmedEmail) {
      const {
        data: existingEmail,
      } = await supabase
        .from("employee")
        .select("id")
        .eq(
          "email",
          trimmedEmail,
        )
        .maybeSingle();

      if (existingEmail) {
        setLoading(false);

        warningAlert(
          "Email Already Exists",
          "Try another email",
        );

        return;
      }
    }

    // INSERT USER
    const { error } =
      await supabase
        .from("employee")
        .insert([
          {
            username:
              trimmedUsername,
            password,
            full_name:
              trimmedFullName,
            phone:
              trimmedPhone,
            email:
              trimmedEmail,
            role: "employee",
          },
        ]);

    setLoading(false);

    if (error) {
      errorAlert(
        "Signup Failed",
        error.message,
      );

      return;
    }

    successAlert(
      "Account Created",
      "Employee account created successfully",
    );

    setTimeout(() => {
      navigate("/login");
    }, 1200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold">
          Create Account
        </h1>

        <p className="mb-6 text-muted-foreground">
          Employee registration
        </p>

        <form
          onSubmit={
            handleSignup
          }
          className="space-y-5"
        >
          {/* FULL NAME */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter full name"
              value={fullName}
              onChange={(e) =>
                setFullName(
                  e.target.value.replace(
                    /[^A-Za-z ]/g,
                    "",
                  ),
                )
              }
              className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-primary"
              required
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Phone Number
            </label>

            <input
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              maxLength={10}
              onChange={(e) =>
                setPhone(
                  e.target.value.replace(
                    /\D/g,
                    "",
                  ),
                )
              }
              className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-primary"
              required
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value,
                )
              }
              className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-primary"
              required
            />
          </div>

          {/* USERNAME */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Username
            </label>

            <input
              type="text"
              placeholder="Choose username"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                    .toLowerCase()
                    .replace(
                      /[^a-z0-9_]/g,
                      "",
                    ),
                )
              }
              className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-primary"
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value,
                )
              }
              className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-primary"
              required
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-5 py-3 text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : "Create Account"}
          </button>

          {/* LOGIN */}
          <div className="text-center">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/login",
                )
              }
              className="text-sm text-primary hover:underline"
            >
              Already have
              account? Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}