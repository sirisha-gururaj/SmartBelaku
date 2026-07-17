import { useState } from "react";
import type { AssignedComplaint } from "../services/mslvl.service";
import StatusBadge from "../../complaints/components/StatusBadge";

const FAULT_CATEGORIES = [
  "Wire Change", "Light Replacement", "Switch Problem", "Jump Repair",
  "Rust Removal", "Pole Damage", "Cable Fault", "Other",
];

interface Props {
  job: AssignedComplaint;
  onStartWork: () => Promise<void>;
  onMarkCompleted: (data: { repair_activities: string[]; repair_notes: string; remarks: string }) => Promise<void>;
}

const JobDetail = ({ job, onStartWork, onMarkCompleted }: Props) => {
  const [starting, setStarting] = useState(false);
  const [activities, setActivities] = useState<string[]>([]);
  const [repairNotes, setRepairNotes] = useState("");
  const [remarks, setRemarks] = useState("");
  const [completing, setCompleting] = useState(false);

  const toggleActivity = (a: string) => {
    setActivities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  };

  const handleStart = async () => {
    setStarting(true);
    try { await onStartWork(); } finally { setStarting(false); }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activities.length === 0) return;
    setCompleting(true);
    try { await onMarkCompleted({ repair_activities: activities, repair_notes: repairNotes, remarks }); }
    finally { setCompleting(false); }
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.area + " " + job.landmark)}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between items-center gap-2 pb-4 border-b">
        <StatusBadge status={job.status} />
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${job.priority === "HIGH" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500"}`}>
          {job.priority} priority
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Ward</p>
          <p className="text-slate-800 font-medium">Ward {job.ward_number}</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Fault Category</p>
          <p className="text-slate-800 font-medium break-words">{job.fault_category}</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Area</p>
        <p className="text-slate-800 break-words">{job.area}</p>
      </div>
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Landmark</p>
        <p className="text-slate-800 break-words">{job.landmark}</p>
      </div>
      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-teal-700 hover:underline">
        Open in Google Maps →
      </a>

      {job.description && (
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Complaint Details</p>
          <p className="text-slate-700 bg-slate-50 rounded-lg p-3 mt-1 break-words">{job.description}</p>
        </div>
      )}

      <div className="pt-2 border-t">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Contact</p>
        <p className="text-slate-800">{job.citizen_name} · {job.contact_number}</p>
      </div>

      {job.status === "ASSIGNED" && (
        <button onClick={handleStart} disabled={starting} className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white py-3 rounded-lg font-medium text-base">
          {starting ? "Starting..." : "Start Work"}
        </button>
      )}

      {job.status === "IN_PROGRESS" && (
        <form onSubmit={handleComplete} className="space-y-4 pt-2 border-t">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Repair Activities <span className="text-red-500">*</span></p>
            <div className="grid grid-cols-2 gap-2">
              {FAULT_CATEGORIES.map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm border rounded-lg p-2 cursor-pointer has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50">
                  <input type="checkbox" checked={activities.includes(a)} onChange={() => toggleActivity(a)} className="accent-teal-700" />
                  {a}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Repair Notes</label>
            <textarea value={repairNotes} onChange={(e) => setRepairNotes(e.target.value)} rows={3} className="w-full border rounded-lg p-3 text-base" placeholder="What was done" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} className="w-full border rounded-lg p-3 text-base" placeholder="Any additional remarks" />
          </div>

          <button type="submit" disabled={completing || activities.length === 0} className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white py-3 rounded-lg font-medium text-base">
            {completing ? "Submitting..." : "Mark Completed"}
          </button>
        </form>
      )}

      {job.status === "COMPLETED" && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 font-medium text-sm">Awaiting Admin verification</p>
          <p className="text-amber-700 text-xs mt-1">You've marked this complete. Nothing more to do until Admin verifies it.</p>
        </div>
      )}

      {job.status === "CLOSED" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium text-sm">Verified and closed</p>
        </div>
      )}

      {(job.repair_activities || job.repair_notes || job.remarks) && (
        <div className="pt-2 border-t space-y-2">
          {job.repair_activities && (
            <p className="text-sm"><span className="text-slate-400">Activities done:</span> {job.repair_activities.join(", ")}</p>
          )}
          {job.repair_notes && <p className="text-sm"><span className="text-slate-400">Notes:</span> {job.repair_notes}</p>}
          {job.remarks && <p className="text-sm"><span className="text-slate-400">Remarks:</span> {job.remarks}</p>}
        </div>
      )}
    </div>
  );
};

export default JobDetail;