import { useEffect, useState } from "react";

import DashboardCard from "../components/DashboardCard";
import { getDashboardStats } from "../services/dashboard.service";

import {
  MdAssignment,
  MdCheckCircle,
  MdNewReleases,
  MdLightbulb,
} from "react-icons/md";

interface DashboardStats {
  streetLights: number;
  complaints: number;
  newComplaints: number;
  completed: number;
  faultCategoryBreakdown: Record<string, number>;
  mslvlWorkload: { id: string; full_name: string; activeJobs: number }[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    streetLights: 0,
    complaints: 0,
    newComplaints: 0,
    completed: 0,
    faultCategoryBreakdown: {},
    mslvlWorkload: [],
  });

  const loadDashboard = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const faultEntries = Object.entries(stats.faultCategoryBreakdown).sort(
    (a, b) => b[1] - a[1]
  );
  const maxFaultCount = faultEntries.length ? faultEntries[0][1] : 1;

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
        {/* Fault Category Breakdown */}
        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Fault Category Breakdown</h2>
          {faultEntries.length === 0 ? (
            <p className="text-slate-400 text-sm">No complaints yet.</p>
          ) : (
            <div className="space-y-3">
              {faultEntries.map(([category, count]) => (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{category}</span>
                    <span className="text-slate-500 font-medium">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-teal-700 h-2 rounded-full"
                      style={{ width: `${(count / maxFaultCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MSLVL Workload Snapshot */}
        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">MSLVL Workload</h2>
          {stats.mslvlWorkload.length === 0 ? (
            <p className="text-slate-400 text-sm">No active MSLVL crews.</p>
          ) : (
            <div className="space-y-3">
              {stats.mslvlWorkload.map((crew) => (
                <div key={crew.id} className="flex justify-between items-center border-b last:border-b-0 pb-3 last:pb-0">
                  <span className="text-slate-700 font-medium">{crew.full_name}</span>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      crew.activeJobs === 0
                        ? "bg-slate-100 text-slate-500"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {crew.activeJobs} active job{crew.activeJobs === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;