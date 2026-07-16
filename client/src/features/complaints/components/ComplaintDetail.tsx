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
}

interface Props {
  complaint: ComplaintDetailData;
  mslvlAccounts: MslvlAccount[];
  onVehicleClick: (id: string) => void;
  onAssign: (mslvlId: string) => Promise<void>;
}

const ComplaintDetail = ({ complaint, mslvlAccounts, onVehicleClick, onAssign }: Props) => {
  const [assigning, setAssigning] = useState(false);

  const handleAssignChange = async (mslvlId: string) => {
    if (!mslvlId) return;
    setAssigning(true);
    try {
      await onAssign(mslvlId);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center pb-4 border-b">
        <StatusBadge status={complaint.status} />
        <span className="text-xs text-slate-400">Filed {new Date(complaint.created_at).toLocaleString()}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <Field label="Citizen Name" value={complaint.citizen_name} />
        <Field label="Contact Number" value={complaint.contact_number} />
        <Field label="Ward" value={`Ward ${complaint.ward_number}`} />
        <Field label="Fault Category" value={complaint.fault_category} />
        <Field label="Source" value={complaint.complaint_source} />
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Assigned To</p>
          {complaint.assigned_mslvl ? (
            <button onClick={() => onVehicleClick(complaint.assigned_mslvl!.id)} className="text-teal-700 font-medium hover:underline">
              {complaint.assigned_mslvl.full_name} →
            </button>
          ) : (
            <div className="relative inline-block">
  <details className="group">
    <summary className="list-none cursor-pointer border rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:border-teal-600 inline-block">
      {assigning ? "Assigning..." : "Assign to..."}
    </summary>
    <div className="mt-1 border rounded-lg bg-white shadow-lg max-h-48 overflow-y-auto w-56">
      {mslvlAccounts.map((m) => (
        <button
          key={m.id}
          disabled={assigning}
          onClick={() => handleAssignChange(m.id)}
          className="w-full text-left px-3 py-2 text-sm hover:bg-teal-50 disabled:opacity-50"
        >
          {m.full_name}
        </button>
      ))}
    </div>
  </details>
</div>
          )}
        </div>
      </div>

      <div className="pt-2 border-t">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Area</p>
        <p className="text-slate-800">{complaint.area}</p>
      </div>
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Landmark</p>
        <p className="text-slate-800">{complaint.landmark}</p>
      </div>
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Description</p>
        <p className="text-slate-700 bg-slate-50 rounded-lg p-3 mt-1">{complaint.description || "No description provided."}</p>
      </div>
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-slate-800 font-medium">{value}</p>
  </div>
);

export default ComplaintDetail;