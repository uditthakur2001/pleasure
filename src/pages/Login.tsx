import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabase";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    const { data: matchedUser, error } = await supabase
      .from("employee")
      .select("id, username, role")
      .eq("username", username.trim())
      .eq("password", password.trim())
      .single();
    setLoading(false);

    if (error || !matchedUser) {
      setLoading(false);

      alert("Invalid username or password");

      return;
    }

    localStorage.setItem("isLoggedIn", "true");

    localStorage.setItem("workerName", matchedUser.username);

    localStorage.setItem("employeeId", matchedUser.id);
    localStorage.setItem("role", matchedUser.role);

    if (matchedUser.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
        <h1 className="mb-2 text-3xl font-bold">Employee Login</h1>

        <p className="mb-6 text-muted-foreground">Enter your credentials</p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Username</label>

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-sm text-primary hover:underline"
            >
              Create new account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
