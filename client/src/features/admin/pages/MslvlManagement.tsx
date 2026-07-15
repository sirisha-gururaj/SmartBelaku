import { useEffect, useState } from "react";
import { getMslvlAccounts, createMslvlAccount } from "../services/mslvl.service";
import type { MslvlAccount } from "../services/mslvl.service";
const MslvlManagement = () => {
  const [accounts, setAccounts] = useState<MslvlAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });

  useEffect(() => {
    void loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await getMslvlAccounts();
      setAccounts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await createMslvlAccount(form);
      setForm({ full_name: "", email: "", phone: "", password: "" });
      setShowForm(false);
      await loadAccounts();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">MSLVL Accounts</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2 rounded-lg"
        >
          {showForm ? "Cancel" : "+ New MSLVL Account"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow border p-6 mb-8 space-y-4 max-w-lg">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle / Crew Name</label>
            <input
              name="full_name" value={form.full_name} onChange={handleChange} required
              placeholder="e.g. MSLVL Vehicle 2"
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Login Email</label>
            <input
              name="email" type="email" value={form.email} onChange={handleChange} required
              placeholder="mslvl2@smartbelaku.in"
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone (optional)</label>
            <input
              name="phone" value={form.phone} onChange={handleChange}
              placeholder="10-digit number"
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              name="password" type="password" value={form.password} onChange={handleChange} required
              placeholder="Minimum 6 characters"
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white py-3 rounded-lg font-medium"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Phone</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">No MSLVL accounts yet.</td></tr>
            ) : (
              accounts.map((acc) => (
                <tr key={acc.id} className="border-t hover:bg-slate-50">
                  <td className="p-4">{acc.full_name}</td>
                  <td className="p-4">{acc.email}</td>
                  <td className="p-4">{acc.phone ?? "—"}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${acc.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {acc.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{new Date(acc.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MslvlManagement;