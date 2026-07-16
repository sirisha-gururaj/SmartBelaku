import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardCard from "../components/DashboardCard";
import { getDashboardStats } from "../services/dashboard.service";
import type { DashboardResponse } from "../services/dashboard.service";
import { useAdminModals } from "../../admin/context/AdminModalContext";

import { MdAssignment, MdCheckCircle, MdNewReleases, MdLightbulb } from "react-icons/md";

const BREAKDOWN_FIELDS: { key: keyof DashboardResponse["breakdowns"]; label: string; paramName: string }[] = [
  { key: "fault_category", label: "Fault Category", paramName: "fault" },
  { key: "status", label: "Complaint Status", paramName: "status" },
  { key: "complaint_source", label: "Complaint Source", paramName: "source" },
  { key: "ward_number", label: "Ward", paramName: "ward" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { openMslvl } = useAdminModals();

  const [stats, setStats] = useState<DashboardResponse>({
    streetLights: 0, complaints: 0, newComplaints: 0, completed: 0,
    breakdowns: { fault_category: {}, status: {}, complaint_source: {}, ward_number: {} },
    mslvlWorkload: [],
  });
  const [breakdownField, setBreakdownField] = useState<keyof DashboardResponse["breakdowns"]>("fault_category");

  useEffect(() => { void loadDashboard(); }, []);
  const loadDashboard = async () => {
    try { setStats(await getDashboardStats()); } catch (e) { console.error(e); }
  };

  const activeBreakdown = BREAKDOWN_FIELDS.find((f) => f.key === breakdownField)!;
  const entries = Object.entries(stats.breakdowns[breakdownField] ?? {}).sort((a, b) => b[1] - a[1]);
  const maxCount = entries.length ? entries[0][1] : 1;

  const handleBreakdownClick = (value: string) => {
    navigate(`/admin/complaints?${activeBreakdown.paramName}=${encodeURIComponent(value)}`);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <DashboardCard title="Street Lights" value={stats.streetLights} icon={<MdLightbulb size={30} />} color="#0F766E" />
        <DashboardCard title="Complaints" value={stats.complaints} icon={<MdAssignment size={30} />} color="#F59E0B" />
        <DashboardCard title="New / Unassigned" value={stats.newComplaints} icon={<MdNewReleases size={30} />} color="#DC2626" />
        <DashboardCard title="Completed" value={stats.completed} icon={<MdCheckCircle size={30} />} color="#16A34A" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Breakdown</h2>
            <select value={breakdownField} onChange={(e) => setBreakdownField(e.target.value as keyof DashboardResponse["breakdowns"])} className="border rounded-lg p-1.5 text-sm">
              {BREAKDOWN_FIELDS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
          </div>
          {entries.length === 0 ? (
            <p className="text-slate-400 text-sm">No complaints yet.</p>
          ) : (
            <div className="space-y-3">
              {entries.map(([value, count]) => (
                <button key={value} onClick={() => handleBreakdownClick(value)} className="w-full text-left group">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 group-hover:text-teal-700">
                      {breakdownField === "ward_number" ? `Ward ${value}` : value.replaceAll("_", " ")}
                    </span>
                    <span className="text-slate-500 font-medium">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-teal-700 h-2 rounded-full group-hover:bg-teal-800" style={{ width: `${(count / maxCount) * 100}%` }} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow border p-6">
          <button onClick={() => navigate("/admin/mslvl")} className="text-lg font-semibold text-slate-800 hover:text-teal-700 mb-4">
            MSLVL Workload →
          </button>
          {stats.mslvlWorkload.length === 0 ? (
            <p className="text-slate-400 text-sm">No active MSLVL crews.</p>
          ) : (
            <div className="space-y-3">
              {stats.mslvlWorkload.map((crew) => (
                <button key={crew.id} onClick={() => openMslvl(crew.id)} className="w-full flex justify-between items-center border-b last:border-b-0 pb-3 last:pb-0 hover:bg-slate-50 -mx-1 px-1 rounded">
                  <span className="text-slate-700 font-medium">{crew.full_name}</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${crew.activeJobs === 0 ? "bg-slate-100 text-slate-500" : "bg-amber-100 text-amber-700"}`}>
                    {crew.activeJobs} active job{crew.activeJobs === 1 ? "" : "s"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;