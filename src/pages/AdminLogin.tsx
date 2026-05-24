import { useState } from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  errorAlert,
  successAlert,
} from "@/lib/alert";

export default function AdminLogin() {
  const navigate =
    useNavigate();

  const [username,
    setUsername] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const handleLogin =
    () => {
      if (
        username === "admin" &&
        password ===
          "admin123"
      ) {
        localStorage.setItem(
          "adminLoggedIn",
          "true",
        );

        successAlert(
          "Admin Login Successful",
        );

        setTimeout(() => {
          navigate("/admin");
        }, 1000);
      } else {
        errorAlert(
          "Login Failed",
          "Invalid admin credentials",
        );
      }
    };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
        <h1 className="mb-6 text-3xl font-bold">
          Admin Login
        </h1>

        <div className="space-y-5">
          <input
            type="text"
            placeholder="Admin Username"
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value,
              )
            }
            className="w-full rounded-xl border border-border px-4 py-3"
          />

          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value,
              )
            }
            className="w-full rounded-xl border border-border px-4 py-3"
          />

          <button
            onClick={
              handleLogin
            }
            className="w-full rounded-xl bg-primary px-4 py-3 text-white"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}