import type { Complaint } from "../pages/Complaints";
import type { MslvlAccount } from "../../admin/services/mslvl.service";
import StatusBadge from "./StatusBadge";

interface Props {
  complaint: Complaint;
  mslvlAccounts: MslvlAccount[];
}

const ComplaintDetail = ({ complaint, mslvlAccounts }: Props) => {
  const assignedTo = mslvlAccounts.find((m) => m.id === complaint.assigned_mslvl_id);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <StatusBadge status={complaint.status} />
        <span className="text-xs text-slate-400">
          Filed {new Date(complaint.created_at).toLocaleString()}
        </span>
      </div>

      <DetailRow label="Citizen Name" value={complaint.citizen_name} />
      <DetailRow label="Contact Number" value={complaint.contact_number} />
      <DetailRow label="Ward" value={`Ward ${complaint.ward_number}`} />
      <DetailRow label="Area" value={complaint.area} />
      <DetailRow label="Landmark" value={complaint.landmark} />
      <DetailRow label="Fault Category" value={complaint.fault_category} />
      <DetailRow label="Source" value={complaint.complaint_source} />
      <DetailRow label="Assigned To" value={assignedTo?.full_name ?? "Not yet assigned"} />
      <DetailRow label="Description" value={complaint.description || "No description provided"} />
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
    <p className="text-slate-700">{value}</p>
  </div>
);

export default ComplaintDetail;