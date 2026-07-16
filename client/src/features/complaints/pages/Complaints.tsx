import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { assignComplaint } from "../services/complaint.service";
import StatusBadge from "../components/StatusBadge";
import Modal from "../../../components/ui/Modal";
import ComplaintForm from "../components/ComplaintForm";
import { useAdminModals } from "../../admin/context/AdminModalContext";

export interface Complaint {
  id: string;
  complaint_number: string;
  citizen_name: string;
  contact_number: string;
  area: string;
  landmark: string;
  ward_number: number;
  fault_category: string;
  description: string | null;
  status: string;
  complaint_source: string;
  assigned_mslvl_id: string | null;
  created_at: string;
}

const STATUS_OPTIONS = ["NEW", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "VERIFIED", "CLOSED"];
const SOURCE_OPTIONS = ["Citizen Portal", "Phone Calls", "Field Inspection", "Office Register", "Internal Survey"];

const Complaints = () => {
  const [searchParams] = useSearchParams();
  const { openComplaint, openMslvl, complaints, mslvlAccounts, refreshAll } = useAdminModals();

  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [showNewComplaintModal, setShowNewComplaintModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "");
  const [sourceFilter, setSourceFilter] = useState(searchParams.get("source") ?? "");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [faultFilter, setFaultFilter] = useState(searchParams.get("fault") ?? "");
  const [wardFilter, setWardFilter] = useState(searchParams.get("ward") ?? "");

  const handleAssign = async (complaintId: string, mslvlId: string) => {
    if (!mslvlId) return;
    setAssigningId(complaintId);
    try {
      await assignComplaint(complaintId, mslvlId);
      await refreshAll();
    } catch (error) {
      console.error(error);
      alert("Failed to assign complaint");
    } finally {
      setAssigningId(null);
    }
  };

  const filteredComplaints = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return complaints.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (sourceFilter && c.complaint_source !== sourceFilter) return false;
      if (faultFilter && c.fault_category !== faultFilter) return false;
      if (wardFilter && String(c.ward_number) !== wardFilter) return false;
      if (assignedFilter === "unassigned" && c.assigned_mslvl_id) return false;
      if (assignedFilter && assignedFilter !== "unassigned" && c.assigned_mslvl_id !== assignedFilter) return false;
      if (dateFilter && new Date(c.created_at).toISOString().slice(0, 10) !== dateFilter) return false;
      if (q) {
        const assignedName = mslvlAccounts.find((m) => m.id === c.assigned_mslvl_id)?.full_name ?? "";
        const haystack = [c.citizen_name, c.description ?? "", c.fault_category, c.complaint_number, c.area, c.landmark, assignedName].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [complaints, statusFilter, sourceFilter, faultFilter, wardFilter, assignedFilter, dateFilter, searchQuery, mslvlAccounts]);

  const clearFilters = () => {
    setStatusFilter(""); setSourceFilter(""); setAssignedFilter("");
    setDateFilter(""); setFaultFilter(""); setWardFilter(""); setSearchQuery("");
  };
  const hasActiveFilters = statusFilter || sourceFilter || assignedFilter || dateFilter || faultFilter || wardFilter || searchQuery;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Complaints</h1>
        <div className="flex gap-3">
          <button onClick={refreshAll} className="border border-teal-700 text-teal-700 px-5 py-2 rounded-lg hover:bg-teal-50">Refresh</button>
          <button onClick={() => setShowNewComplaintModal(true)} className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2 rounded-lg">+ New Complaint</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border p-4 mb-5 space-y-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by citizen name, vehicle, description, fault type..."
          className="w-full border rounded-lg p-2 text-sm"
        />
        <div className="flex flex-wrap gap-3 items-center">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg p-2 text-sm">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
          </select>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="border rounded-lg p-2 text-sm">
            <option value="">All Sources</option>
            {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={assignedFilter} onChange={(e) => setAssignedFilter(e.target.value)} className="border rounded-lg p-2 text-sm">
            <option value="">All Assignments</option>
            <option value="unassigned">Unassigned</option>
            {mslvlAccounts.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
          </select>
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="border rounded-lg p-2 text-sm" />
          {faultFilter && <span className="text-xs bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full">Fault: {faultFilter} <button onClick={() => setFaultFilter("")} className="ml-1 font-bold">×</button></span>}
          {wardFilter && <span className="text-xs bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full">Ward: {wardFilter} <button onClick={() => setWardFilter("")} className="ml-1 font-bold">×</button></span>}
          {hasActiveFilters && <button onClick={clearFilters} className="text-sm text-red-600 hover:underline ml-auto">Clear filters</button>}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-4">Complaint No</th>
              <th className="text-left p-4">Citizen</th>
              <th className="text-left p-4">Area</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Assign</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">No complaints match these filters.</td></tr>
            ) : (
              filteredComplaints.map((complaint) => (
                <tr key={complaint.id} className="border-t hover:bg-slate-50 cursor-pointer" onClick={() => openComplaint(complaint.id)}>
                  <td className="p-4 font-mono">{complaint.complaint_number}</td>
                  <td className="p-4">{complaint.citizen_name}</td>
                  <td className="p-4">{complaint.area}</td>
                  <td className="p-4"><StatusBadge status={complaint.status} /></td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    {complaint.assigned_mslvl_id ? (
                      <button onClick={() => openMslvl(complaint.assigned_mslvl_id!)} className="text-sm text-teal-700 hover:underline font-medium">
                        {mslvlAccounts.find((m) => m.id === complaint.assigned_mslvl_id)?.full_name ?? "Assigned"}
                      </button>
                    ) : (
                      <select defaultValue="" disabled={assigningId === complaint.id} onChange={(e) => handleAssign(complaint.id, e.target.value)} className="border rounded-lg p-2 text-sm">
                        <option value="" disabled>{assigningId === complaint.id ? "Assigning..." : "Assign to..."}</option>
                        {mslvlAccounts.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                      </select>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showNewComplaintModal} onClose={() => setShowNewComplaintModal(false)} title="Register Complaint">
        <ComplaintForm mode="admin" onSuccess={() => { setShowNewComplaintModal(false); refreshAll(); }} />
      </Modal>
    </div>
  );
};

export default Complaints;