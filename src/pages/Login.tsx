import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabase";

import { errorAlert } from "@/lib/alert";

export default function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // CHECK ALREADY LOGGED IN
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      localStorage.setItem("isLoggedIn", "true");

      localStorage.setItem(
        "employeeName",
        session.user.user_metadata?.full_name || "",
      );

      localStorage.setItem("employeeEmail", session.user.email || "");

      localStorage.setItem("employeeId", session.user.id);

      // SAVE GOOGLE USER
      await supabase.from("employee").upsert([
        {
          google_id: session.user.id,

          full_name: session.user.user_metadata?.full_name || "",

          email: session.user.email || "",

          username: session.user.email?.split("@")[0] || "",

          role: "employee",
        },
      ]);

      navigate("/dashboard");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",

        options: {
          redirectTo: window.location.origin + "/login",
          scopes:
            "openid email profile https://www.googleapis.com/auth/contacts.readonly https://www.googleapis.com/auth/calendar",
        },
      });

      if (error) {
        errorAlert("Google Login Failed", error.message);
      }
    } catch (err: any) {
      errorAlert("Login Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
        <h1 className="mb-2 text-3xl font-bold">Employee Login</h1>

        <p className="mb-6 text-muted-foreground">
          Continue using your Google account
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Connecting..." : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}
