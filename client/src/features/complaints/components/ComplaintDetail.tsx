import { useState } from "react";
import StatusBadge from "./StatusBadge";
import type { MslvlAccount } from "../../admin/services/mslvl.service";

export interface ComplaintDetailData {
  id: string;
  complaint_number: string;
  citizen_name: string;
  contact_number: string;
  ward_number: number;
  area: string;
  landmark: string;
  fault_category: string;
  description: string | null;
  status: string;
  complaint_source: string;
  assigned_mslvl: { id: string; full_name: string } | null;
  created_at: string;
  repair_activities: string[] | null;
  repair_notes: string | null;
  remarks: string | null;
  work_started_at: string | null;
  completed_at: string | null;
  verified_at: string | null;
  closed_at: string | null;
}

interface Props {
  complaint: ComplaintDetailData;
  mslvlAccounts: MslvlAccount[];
  onVehicleClick: (id: string) => void;
  onAssign: (mslvlId: string) => Promise<void>;
  onVerifyClose: () => Promise<void>;
}

const ComplaintDetail = ({ complaint, mslvlAccounts, onVehicleClick, onAssign, onVerifyClose }: Props) => {
  const [assigning, setAssigning] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleAssignClick = async (mslvlId: string) => {
    if (!mslvlId) return;
    setAssigning(true);
    try {
      await onAssign(mslvlId);
      setShowAssign(false);
    } finally {
      setAssigning(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await onVerifyClose();
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between items-center gap-2 pb-4 border-b">
        <StatusBadge status={complaint.status} />
        <span className="text-xs text-slate-400">Filed {new Date(complaint.created_at).toLocaleString()}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <Field label="Citizen Name" value={complaint.citizen_name} />
        <Field label="Contact Number" value={complaint.contact_number} />
        <Field label="Ward" value={`Ward ${complaint.ward_number}`} />
        <Field label="Fault Category" value={complaint.fault_category} />
        <Field label="Source" value={complaint.complaint_source} />
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Assigned To</p>
          {complaint.assigned_mslvl ? (
            <button onClick={() => onVehicleClick(complaint.assigned_mslvl!.id)} className="text-teal-700 font-medium hover:underline break-words">
              {complaint.assigned_mslvl.full_name} →
            </button>
          ) : showAssign ? (
            <div className="border rounded-lg bg-white shadow-sm max-h-40 overflow-y-auto">
              {mslvlAccounts.map((m) => (
                <button
                  key={m.id}
                  disabled={assigning}
                  onClick={() => handleAssignClick(m.id)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-teal-50 disabled:opacity-50 border-b last:border-b-0"
                >
                  {m.full_name}
                </button>
              ))}
            </div>
          ) : (
            <button onClick={() => setShowAssign(true)} className="border rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:border-teal-600">
              {assigning ? "Assigning..." : "Assign to..."}
            </button>
          )}
        </div>
      </div>

      <div className="pt-2 border-t">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Area</p>
        <p className="text-slate-800 break-words">{complaint.area}</p>
      </div>
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Landmark</p>
        <p className="text-slate-800 break-words">{complaint.landmark}</p>
      </div>
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Description</p>
        <p className="text-slate-700 bg-slate-50 rounded-lg p-3 mt-1 break-words">{complaint.description || "No description provided."}</p>
      </div>

      {(complaint.repair_activities || complaint.repair_notes || complaint.remarks) && (
        <div className="pt-2 border-t space-y-3">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Work Done</p>
          {complaint.repair_activities && (
            <div>
              <p className="text-xs text-slate-400 mb-1">Repair Activities</p>
              <div className="flex flex-wrap gap-1.5">
                {complaint.repair_activities.map((a) => (
                  <span key={a} className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full">{a}</span>
                ))}
              </div>
            </div>
          )}
          {complaint.repair_notes && (
            <div>
              <p className="text-xs text-slate-400 mb-1">Repair Notes</p>
              <p className="text-slate-700 text-sm break-words">{complaint.repair_notes}</p>
            </div>
          )}
          {complaint.remarks && (
            <div>
              <p className="text-xs text-slate-400 mb-1">Remarks</p>
              <p className="text-slate-700 text-sm break-words">{complaint.remarks}</p>
            </div>
          )}
          <div className="text-xs text-slate-400 space-y-0.5">
            {complaint.work_started_at && <p>Started: {new Date(complaint.work_started_at).toLocaleString()}</p>}
            {complaint.completed_at && <p>Completed: {new Date(complaint.completed_at).toLocaleString()}</p>}
            {complaint.verified_at && <p>Verified & Closed: {new Date(complaint.verified_at).toLocaleString()}</p>}
          </div>
        </div>
      )}

      {complaint.status === "COMPLETED" && (
        <div className="pt-2 border-t">
          <button onClick={handleVerify} disabled={verifying} className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white py-3 rounded-lg font-medium text-base">
            {verifying ? "Verifying..." : "Verify & Close Complaint"}
          </button>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-slate-800 font-medium break-words">{value}</p>
  </div>
);

export default ComplaintDetail;