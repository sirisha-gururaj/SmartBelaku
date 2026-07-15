import { useState } from "react";
import { trackComplaint } from "../../complaints/services/complaint.service";
import StatusBadge from "../../complaints/components/StatusBadge";

interface ComplaintStatus {
  complaint_number: string;
  status: string;
  area: string;
  ward_number: number;
  fault_category: string;
  created_at: string;
  updated_at: string;
}

const TrackComplaint = () => {
  const [complaintNumber, setComplaintNumber] = useState("");
  const [result, setResult] = useState<ComplaintStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintNumber.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await trackComplaint(complaintNumber.trim());
      setResult(data);
    } catch {
      setError("No complaint found with that number. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Track Complaint</h1>
        <p className="text-slate-500 text-sm mb-6">Enter the complaint number you received.</p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            value={complaintNumber}
            onChange={(e) => setComplaintNumber(e.target.value)}
            placeholder="e.g. CMP-1003"
            className="flex-1 border rounded-lg p-3 focus:ring-2 focus:ring-teal-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white px-5 rounded-lg font-medium"
          >
            {loading ? "..." : "Search"}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>
        )}

        {result && (
          <div className="border rounded-lg p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-mono font-semibold text-slate-800">{result.complaint_number}</span>
              <StatusBadge status={result.status} />
            </div>
            <div className="text-sm text-slate-600 space-y-1">
              <p><span className="text-slate-400">Area:</span> {result.area} (Ward {result.ward_number})</p>
              <p><span className="text-slate-400">Issue:</span> {result.fault_category}</p>
              <p><span className="text-slate-400">Reported:</span> {new Date(result.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackComplaint;