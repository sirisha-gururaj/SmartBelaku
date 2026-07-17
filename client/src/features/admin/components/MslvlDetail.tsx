import { useState } from "react";
import type { MslvlCrewDetail } from "../services/mslvl.service";
import type { Complaint } from "../../complaints/pages/Complaints";
import StatusBadge from "../../complaints/components/StatusBadge";

interface Props {
  crew: MslvlCrewDetail;
  unassignedComplaints: Complaint[];
  onAssignComplaint: (complaintId: string) => Promise<void>;
  onComplaintClick: (complaintId: string) => void;
}

const MslvlDetail = ({ crew, unassignedComplaints, onAssignComplaint, onComplaintClick }: Props) => {
  const [showAssign, setShowAssign] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const activeJobs = crew.complaints.filter((c) => !["COMPLETED", "CLOSED", "VERIFIED"].includes(c.status));
  const closedJobs = crew.complaints.filter((c) => ["COMPLETED", "CLOSED", "VERIFIED"].includes(c.status));

  const handleAssign = async (complaintId: string) => {
    if (!complaintId) return;
    setAssigning(true);
    try {
      await onAssignComplaint(complaintId);
      setShowAssign(false);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="min-w-0">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Email</p>
          <p className="text-slate-700 break-words">{crew.email}</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Phone</p>
          <p className="text-slate-700 break-words">{crew.phone ?? "—"}</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Status</p>
          <span className={`text-xs px-2 py-1 rounded-full ${crew.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
            {crew.is_active ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Total Jobs</p>
          <p className="text-slate-700">{crew.complaints.length} ({activeJobs.length} active)</p>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
          <h3 className="font-semibold text-slate-800">Assigned Complaints</h3>
          <button onClick={() => setShowAssign((s) => !s)} className="text-xs text-teal-700 hover:underline font-medium">
            {showAssign ? "Cancel" : "+ Assign a Complaint"}
          </button>
        </div>

        {showAssign && (
          <div className="mb-4 bg-slate-50 rounded-lg p-3">
            {unassignedComplaints.length === 0 ? (
              <p className="text-sm text-slate-400">No unassigned complaints available right now.</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-1.5">
                {unassignedComplaints.map((c) => (
                  <button
                    key={c.id}
                    disabled={assigning}
                    onClick={() => handleAssign(c.id)}
                    className="w-full text-left bg-white border rounded-lg p-2.5 text-sm hover:border-teal-600 hover:bg-teal-50 transition disabled:opacity-50"
                  >
                    <span className="font-mono font-medium text-slate-800">{c.complaint_number}</span>
                    <span className="text-slate-500"> — {c.area} ({c.fault_category})</span>
                  </button>
                ))}
              </div>
            )}
            {assigning && <p className="text-xs text-teal-700 mt-2">Assigning...</p>}
          </div>
        )}

        {crew.complaints.length === 0 ? (
          <p className="text-sm text-slate-400">No complaints assigned yet.</p>
        ) : (
          <div className="space-y-2">
            {crew.complaints.map((c) => (
              <button
                key={c.id}
                onClick={() => onComplaintClick(c.id)}
                className="w-full border rounded-lg p-3 text-left hover:border-teal-600 hover:bg-slate-50 transition"
              >
                <div className="flex justify-between items-start gap-2 mb-1">
                  <span className="font-mono text-sm font-medium text-slate-800">{c.complaint_number}</span>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-xs text-slate-500 break-words">{c.area} · Ward {c.ward_number} · {c.fault_category}</p>
                <p className="text-xs text-slate-400 mt-0.5">Assigned {new Date(c.assigned_at).toLocaleDateString()}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {closedJobs.length > 0 && (
        <p className="text-xs text-slate-400">
          {closedJobs.length} completed/closed job{closedJobs.length === 1 ? "" : "s"} in history.
        </p>
      )}
    </div>
  );
};

export default MslvlDetail;