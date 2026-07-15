import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAssignedComplaints } from "../services/mslvl.service";
import type { AssignedComplaint } from "../services/mslvl.service";import StatusBadge from "../../complaints/components/StatusBadge";

const MslvlDashboard = () => {
  const [jobs, setJobs] = useState<AssignedComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    void loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await getAssignedComplaints();
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Assigned Jobs</h1>
          <p className="text-slate-500 text-sm mt-1">Street light complaints assigned to your crew.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadJobs} className="border border-teal-700 text-teal-700 px-5 py-2 rounded-lg hover:bg-teal-50">
            Refresh
          </button>
          <button onClick={() => navigate("/mslvl/complaints/new")} className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2 rounded-lg">
            + Log a Complaint
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow border p-12 text-center text-slate-500">
          No jobs assigned to you yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl shadow border p-5">
              <div className="flex justify-between items-start mb-3">
                <span className="font-mono font-semibold text-slate-800">{job.complaint_number}</span>
                <StatusBadge status={job.status} />
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-600">
                <p><span className="text-slate-400">Ward:</span> {job.ward_number}</p>
                <p><span className="text-slate-400">Fault:</span> {job.fault_category}</p>
                <p className="col-span-2"><span className="text-slate-400">Area:</span> {job.area}</p>
                <p className="col-span-2"><span className="text-slate-400">Landmark:</span> {job.landmark}</p>
                <p className="col-span-2"><span className="text-slate-400">Description:</span> {job.description}</p>
                <p><span className="text-slate-400">Contact:</span> {job.citizen_name}, {job.contact_number}</p>
                <p><span className="text-slate-400">Assigned:</span> {new Date(job.assigned_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MslvlDashboard;