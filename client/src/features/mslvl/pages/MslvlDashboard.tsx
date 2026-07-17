import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAssignedComplaints, getTodayCrewLog, submitCrewLog, startWork, markCompleted,
} from "../services/mslvl.service";
import type { AssignedComplaint, CrewMember } from "../services/mslvl.service";
import StatusBadge from "../../complaints/components/StatusBadge";
import Modal from "../../../components/ui/Modal";
import CrewLogForm from "../components/CrewLogForm";
import JobDetail from "../components/JobDetail";

const MslvlDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<AssignedComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [crewSubmitted, setCrewSubmitted] = useState(false);
  const [crewSummary, setCrewSummary] = useState<CrewMember[]>([]);
  const [prefillCrew, setPrefillCrew] = useState<CrewMember[] | null>(null);
  const [selectedJob, setSelectedJob] = useState<AssignedComplaint | null>(null);

  useEffect(() => {
    void loadJobs();
    void loadTodayCrewForPrefill();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try { setJobs(await getAssignedComplaints()); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const loadTodayCrewForPrefill = async () => {
    try {
      const log = await getTodayCrewLog();
      if (log) setPrefillCrew(log.crew_members);
    } catch (e) { console.error(e); }
  };

  const handleCrewSubmit = async (members: CrewMember[]) => {
    await submitCrewLog(members);
    setCrewSummary(members);
    setCrewSubmitted(true);
  };

  const openJob = (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (job) setSelectedJob(job);
  };

  const handleStartWork = async () => {
    if (!selectedJob) return;
    const updated = await startWork(selectedJob.id);
    setSelectedJob(updated);
    await loadJobs();
  };

  const handleMarkCompleted = async (data: { repair_activities: string[]; repair_notes: string; remarks: string }) => {
    if (!selectedJob) return;
    const updated = await markCompleted(selectedJob.id, data);
    setSelectedJob(updated);
    await loadJobs();
  };

  if (!crewSubmitted) {
    return (
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Before You Start</h1>
        <p className="text-slate-500 text-sm mb-6">Enter today's crew to view your assigned jobs.</p>
        <CrewLogForm onSubmit={handleCrewSubmit} initialMembers={prefillCrew ?? undefined} />
      </div>
    );
  }

  const activeJobs = jobs.filter((j) => !["COMPLETED", "CLOSED", "VERIFIED"].includes(j.status));
  const pastJobs = jobs.filter((j) => ["COMPLETED", "CLOSED", "VERIFIED"].includes(j.status));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Assigned Jobs</h1>
          <p className="text-slate-500 text-sm mt-1">Street light complaints assigned to your crew.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadJobs} className="flex-1 sm:flex-none border border-teal-700 text-teal-700 px-4 py-2 rounded-lg hover:bg-teal-50 text-sm">Refresh</button>
          <button onClick={() => navigate("/mslvl/complaints/new")} className="flex-1 sm:flex-none bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-sm">+ Log a Complaint</button>
        </div>
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-5 text-sm text-teal-800">
        Today's crew: {crewSummary.map((m) => m.name).join(", ")}
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow border p-8 sm:p-12 text-center text-slate-500">
          No jobs assigned to you yet.
        </div>
      ) : (
        <>
          {activeJobs.length > 0 && (
            <div className="grid gap-3 mb-6">
              {activeJobs.map((job) => (
                <button key={job.id} onClick={() => openJob(job.id)} className="bg-white rounded-xl shadow border p-4 text-left hover:border-teal-600 active:bg-slate-50 transition">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="font-mono font-semibold text-slate-800">{job.complaint_number}</span>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="text-sm text-slate-600 truncate">{job.area}</p>
                  <p className="text-xs text-slate-400 mt-1">Ward {job.ward_number} · {job.fault_category}</p>
                </button>
              ))}
            </div>
          )}

          {pastJobs.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Completed / Closed</h2>
              <div className="grid gap-2">
                {pastJobs.map((job) => (
                  <button key={job.id} onClick={() => openJob(job.id)} className="bg-white rounded-xl shadow-sm border p-3 text-left opacity-75 hover:opacity-100 transition">
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-mono text-sm text-slate-700">{job.complaint_number}</span>
                      <StatusBadge status={job.status} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Modal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} title={selectedJob?.complaint_number ?? ""}>
        {selectedJob && (
          <JobDetail job={selectedJob} onStartWork={handleStartWork} onMarkCompleted={handleMarkCompleted} />
        )}
      </Modal>
    </div>
  );
};

export default MslvlDashboard;