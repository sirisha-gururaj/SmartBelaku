import { useEffect, useMemo, useState } from "react";

import { getComplaints, assignComplaint } from "../services/complaint.service";
import { getMslvlAccounts } from "../../admin/services/mslvl.service";
import type { MslvlAccount } from "../../admin/services/mslvl.service";
import StatusBadge from "../components/StatusBadge";
import Modal from "../../../components/ui/Modal";
import ComplaintForm from "../components/ComplaintForm";
import ComplaintDetail from "../components/ComplaintDetail";

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
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [mslvlAccounts, setMslvlAccounts] = useState<MslvlAccount[]>([]);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [showNewComplaintModal, setShowNewComplaintModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    void loadComplaints();
    void loadMslvlAccounts();
  }, []);

  const loadComplaints = async () => {
    try {
      const data = await getComplaints();
      setComplaints(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadMslvlAccounts = async () => {
    try {
      const data = await getMslvlAccounts();
      setMslvlAccounts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssign = async (complaintId: string, mslvlId: string) => {
    if (!mslvlId) return;
    setAssigningId(complaintId);
    try {
      await assignComplaint(complaintId, mslvlId);
      await loadComplaints();
    } catch (error) {
      console.error(error);
      alert("Failed to assign complaint");
    } finally {
      setAssigningId(null);
    }
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (sourceFilter && c.complaint_source !== sourceFilter) return false;
      if (assignedFilter === "unassigned" && c.assigned_mslvl_id) return false;
      if (assignedFilter && assignedFilter !== "unassigned" && c.assigned_mslvl_id !== assignedFilter) return false;
      if (dateFilter) {
        const complaintDate = new Date(c.created_at).toISOString().slice(0, 10);
        if (complaintDate !== dateFilter) return false;
      }
      return true;
    });
  }, [complaints, statusFilter, sourceFilter, assignedFilter, dateFilter]);

  const clearFilters = () => {
    setStatusFilter("");
    setSourceFilter("");
    setAssignedFilter("");
    setDateFilter("");
  };

  const hasActiveFilters = statusFilter || sourceFilter || assignedFilter || dateFilter;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Complaints</h1>
        <div className="flex gap-3">
          <button onClick={loadComplaints} className="border border-teal-700 text-teal-700 px-5 py-2 rounded-lg hover:bg-teal-50">
            Refresh
          </button>
          <button onClick={() => setShowNewComplaintModal(true)} className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2 rounded-lg">
            + New Complaint
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow border p-4 mb-5 flex flex-wrap gap-3 items-center">
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

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border rounded-lg p-2 text-sm"
        />

        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-sm text-red-600 hover:underline ml-auto">
            Clear filters
          </button>
        )}
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
                <tr
                  key={complaint.id}
                  className="border-t hover:bg-slate-50 cursor-pointer"
                  onClick={() => setSelectedComplaint(complaint)}
                >
                  <td className="p-4 font-mono">{complaint.complaint_number}</td>
                  <td className="p-4">{complaint.citizen_name}</td>
                  <td className="p-4">{complaint.area}</td>
                  <td className="p-4"><StatusBadge status={complaint.status} /></td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    {complaint.assigned_mslvl_id ? (
                      <span className="text-sm text-slate-500">
                        {mslvlAccounts.find((m) => m.id === complaint.assigned_mslvl_id)?.full_name ?? "Assigned"}
                      </span>
                    ) : (
                      <select
                        defaultValue=""
                        disabled={assigningId === complaint.id}
                        onChange={(e) => handleAssign(complaint.id, e.target.value)}
                        className="border rounded-lg p-2 text-sm"
                      >
                        <option value="" disabled>
                          {assigningId === complaint.id ? "Assigning..." : "Assign to..."}
                        </option>
                        {mslvlAccounts.map((m) => (
                          <option key={m.id} value={m.id}>{m.full_name}</option>
                        ))}
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
        <ComplaintForm
          mode="admin"
          onSuccess={() => {
            setShowNewComplaintModal(false);
            loadComplaints();
          }}
        />
      </Modal>

      <Modal isOpen={!!selectedComplaint} onClose={() => setSelectedComplaint(null)} title={selectedComplaint?.complaint_number ?? ""}>
        {selectedComplaint && (
          <ComplaintDetail
            complaint={selectedComplaint}
            mslvlAccounts={mslvlAccounts}
          />
        )}
      </Modal>
    </div>
  );
};

export default Complaints;