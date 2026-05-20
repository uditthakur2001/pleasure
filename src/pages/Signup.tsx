import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabase";

export default function Signup() {
  const navigate = useNavigate();

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
      username.trim().toLowerCase();

    const trimmedFullName =
      fullName.trim();

    const trimmedPhone =
      phone.trim();

    const trimmedEmail =
      email.trim().toLowerCase();

    // FULL NAME VALIDATION
    if (
      !/^[A-Za-z ]{3,50}$/.test(
        trimmedFullName,
      )
    ) {
      alert(
        "Enter valid full name",
      );

      return;
    }

    // PHONE VALIDATION
    if (
      !/^[6-9]\d{9}$/.test(
        trimmedPhone,
      )
    ) {
      alert(
        "Enter valid 10 digit phone number",
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
      alert(
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
      alert(
        "Username must be 4-20 characters",
      );

      return;
    }

    // PASSWORD VALIDATION
    if (password.length < 6) {
      alert(
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

      alert(
        "Username already exists",
      );

      return;
    }

    // CHECK UNIQUE PHONE
    const {
      data: existingPhone,
    } = await supabase
      .from("employee")
      .select("id")
      .eq("phone", trimmedPhone)
      .maybeSingle();

    if (existingPhone) {
      setLoading(false);

      alert(
        "Phone number already exists",
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

        alert(
          "Email already exists",
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
            phone: trimmedPhone,
            email: trimmedEmail,
            role: "employee",
          },
        ]);

    setLoading(false);

    if (error) {
      alert(error.message);

      return;
    }

    alert(
      "Account created successfully",
    );

    navigate("/login");
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
          onSubmit={handleSignup}
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
              className="w-full rounded-lg border border-border px-4 py-3"
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
              className="w-full rounded-lg border border-border px-4 py-3"
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
              className="w-full rounded-lg border border-border px-4 py-3"
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
              className="w-full rounded-lg border border-border px-4 py-3"
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
              className="w-full rounded-lg border border-border px-4 py-3"
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
                navigate("/login")
              }
              className="text-sm text-primary hover:underline"
            >
              Already have account?
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}