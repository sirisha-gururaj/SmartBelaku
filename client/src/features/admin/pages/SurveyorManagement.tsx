import { useEffect, useState } from "react";
import { getSurveyorAccounts, createSurveyorAccount } from "../services/surveyor.service";
import type { SurveyorAccount } from "../services/surveyor.service";
import Modal from "../../../components/ui/Modal";

const SurveyorManagement = () => {
  const [accounts, setAccounts] = useState<SurveyorAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });

  const load = async () => {
    setLoading(true);
    try { setAccounts(await getSurveyorAccounts()); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setSaving(true);
    try {
      await createSurveyorAccount(form);
      setForm({ full_name: "", email: "", phone: "", password: "" });
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to create account");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full border rounded-lg p-3 text-base focus:ring-2 focus:ring-teal-600 focus:outline-none";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Surveyor Accounts</h1>
        <button onClick={() => setShowForm(true)} className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2 rounded-lg text-sm sm:text-base">
          + New Surveyor Account
        </button>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Surveyor Account">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input name="full_name" value={form.full_name} onChange={handleChange} required placeholder="e.g. Surveyor 1" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Login Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="surveyor1@smartbelaku.in" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone (optional)</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit number" inputMode="numeric" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Minimum 6 characters" className={inputClass} />
          </div>
          <button type="submit" disabled={saving} className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white py-3 rounded-lg font-medium text-base">
            {saving ? "Creating..." : "Create Account"}
          </button>
        </form>
      </Modal>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : accounts.length === 0 ? (
        <div className="bg-white rounded-xl shadow border p-8 sm:p-12 text-center text-slate-500">No Surveyor accounts yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div key={acc.id} className="bg-white rounded-xl shadow border p-5 min-w-0">
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="font-semibold text-slate-800 truncate">{acc.full_name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${acc.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                  {acc.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-sm text-slate-500 truncate">{acc.email}</p>
              <p className="text-sm text-slate-500">{acc.phone ?? "No phone on file"}</p>
              <p className="text-xs text-teal-700 mt-3 font-medium">{acc.totalSurveys} survey{acc.totalSurveys === 1 ? "" : "s"} submitted</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SurveyorManagement;
