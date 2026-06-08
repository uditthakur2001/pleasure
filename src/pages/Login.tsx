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

    if (!session) return;

    const email = session.user.email;

    // CHECK AUTHORIZED EMAIL
    const { data: employee, error } = await supabase
      .from("employee")
      .select("*")
      .eq("email", email)
      .single();

    // NOT AUTHORIZED
    if (error || !employee) {
      await supabase.auth.signOut();
      localStorage.clear();
      errorAlert("Access Denied", "Your Google account is not authorized");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

      return;
    }

    // LOGIN SUCCESS
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("employeeName", employee.full_name || "");
    localStorage.setItem("employeeEmail", employee.email || "");
    localStorage.setItem("employeeId", employee.id);
    localStorage.setItem("role", employee.role || "employee");

    // UPDATE GOOGLE ID
    await supabase
      .from("employee")
      .update({
        google_id: session.user.id,
      })
      .eq("email", email);

    if (employee.role === "admin") {
      navigate("/admin");
    } else {
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
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
        
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Employee Login</h1>
          <p className="mt-2 text-muted-foreground">
            Continue using your Google account
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-4 py-3.5 font-medium text-white shadow-sm transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </div>
          )}
          
          <span>{loading ? "Connecting..." : "Continue with Google"}</span>
        </button>
      </div>
    </div>
  );
}