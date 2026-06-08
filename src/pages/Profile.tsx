import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function Profile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [userId, setUserId] = useState<number | null>(null);

  const [username, setUsername] = useState("");

  const [fullName, setFullName] = useState("");

  const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");

  useEffect(() => {
    const workerName = localStorage.getItem("workerName");

    if (!workerName) {
      navigate("/login");
      return;
    }

    fetchProfile(workerName);
  }, [navigate]);

  const fetchProfile = async (workerName: string) => {
    const { data, error } = await supabase
      .from("employee")
      .select("*")
      .eq("username", workerName)
      .single();

    if (error || !data) {
      console.log(error);
      return;
    }

    setUserId(data.id);

    setUsername(data.username || "");

    setFullName(data.full_name || "");

    setPhone(data.phone || "");

    setEmail(data.email || "");
  };

  const updateProfile = async () => {
    if (!userId) return;

    setLoading(true);

    const { error } = await supabase
      .from("employee")
      .update({
        full_name: fullName,
        phone,
        email,
      })
      .eq("id", userId);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Profile updated");
  };

  const deleteAccount = async () => {
    const confirmDelete = window.confirm("Delete your account permanently?");

    if (!confirmDelete || !userId) return;

    const { error } = await supabase.from("employee").delete().eq("id", userId);

    if (error) {
      alert(error.message);
      return;
    }

    localStorage.removeItem("isLoggedIn");

    localStorage.removeItem("workerName");

    alert("Account deleted");

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold">Profile</h1>

        <p className="mb-6 text-muted-foreground">
          Manage your account details
        </p>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Username</label>

            <input
              type="text"
              value={username}
              disabled
              className="w-full rounded-lg border border-border bg-muted px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Full Name</label>

            <input
              type="text"
              placeholder="Enter full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Phone Number
            </label>

            <input
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Email (Optional)
            </label>

            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-3"
            />
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <button
              onClick={updateProfile}
              disabled={loading}
              className="rounded-lg bg-primary px-5 py-3 text-white"
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>

            <button
              onClick={deleteAccount}
              className="rounded-lg bg-red-500 px-5 py-3 text-white"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
