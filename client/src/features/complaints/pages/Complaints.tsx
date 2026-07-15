import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getComplaints, assignComplaint } from "../services/complaint.service";
import { getMslvlAccounts } from "../../admin/services/mslvl.service";
import type { MslvlAccount } from "../../admin/services/mslvl.service";import StatusBadge from "../components/StatusBadge";

interface Complaint {
  id: string;
  complaint_number: string;
  citizen_name: string;
  area: string;
  status: string;
  complaint_source: string;
  assigned_mslvl_id: string | null;
}

const Complaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [mslvlAccounts, setMslvlAccounts] = useState<MslvlAccount[]>([]);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const navigate = useNavigate();

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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Complaints</h1>
        <div className="flex gap-3">
          <button onClick={loadComplaints} className="border border-teal-700 text-teal-700 px-5 py-2 rounded-lg hover:bg-teal-50">
            Refresh
          </button>
          <button onClick={() => navigate("/admin/complaints/new")} className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2 rounded-lg">
            + New Complaint
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-5">
        <input type="text" placeholder="Search complaint..." className="border rounded-lg px-4 py-2 w-80" />
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-4">Complaint No</th>
              <th className="text-left p-4">Citizen</th>
              <th className="text-left p-4">Area</th>
              <th className="text-left p-4">Source</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Assign</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">No complaints found.</td></tr>
            ) : (
              complaints.map((complaint) => (
                <tr key={complaint.id} className="border-t hover:bg-slate-50">
                  <td className="p-4">{complaint.complaint_number}</td>
                  <td className="p-4">{complaint.citizen_name}</td>
                  <td className="p-4">{complaint.area}</td>
                  <td className="p-4 text-sm text-slate-500">{complaint.complaint_source}</td>
                  <td className="p-4"><StatusBadge status={complaint.status} /></td>
                  <td className="p-4">
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
    </div>
  );
};

export default Complaints;