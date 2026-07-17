import { useState } from "react";
import type { CrewMember } from "../services/mslvl.service";

interface Props {
  onSubmit: (members: CrewMember[]) => Promise<void>;
  initialMembers?: CrewMember[];
}

const CrewLogForm = ({ onSubmit, initialMembers }: Props) => {
  const [members, setMembers] = useState<CrewMember[]>(
    initialMembers && initialMembers.length > 0 ? initialMembers : [{ name: "", phone: "" }]
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMember = (index: number, field: keyof CrewMember, value: string) => {
    setMembers((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const addRow = () => setMembers((prev) => [...prev, { name: "", phone: "" }]);
  const removeRow = (index: number) => setMembers((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const valid = members.filter((m) => m.name.trim() && m.phone.trim());
    if (valid.length === 0) {
      setError("Enter at least one crew member before continuing.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(valid);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow border p-4 sm:p-5 w-full max-w-lg">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="space-y-4 mb-4">
        {members.map((m, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-2 border-b sm:border-b-0 pb-3 sm:pb-0 last:border-b-0">
            <input
              value={m.name}
              onChange={(e) => updateMember(i, "name", e.target.value)}
              placeholder="Name"
              className="w-full sm:flex-1 min-w-0 border rounded-lg p-2.5 text-base"
            />
            <div className="flex gap-2">
              <input
                value={m.phone}
                onChange={(e) => updateMember(i, "phone", e.target.value)}
                placeholder="Phone"
                inputMode="numeric"
                className="w-full sm:flex-1 min-w-0 border rounded-lg p-2.5 text-base"
              />
              {members.length > 1 && (
                <button type="button" onClick={() => removeRow(i)} className="text-red-500 px-2 shrink-0 text-lg">×</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={addRow} className="text-sm text-teal-700 hover:underline mb-4">
        + Add crew member
      </button>

      <button type="submit" disabled={submitting} className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white py-2.5 rounded-lg font-medium text-base">
        {submitting ? "Saving..." : "Continue to Assigned Jobs"}
      </button>
    </form>
  );
};

export default CrewLogForm;