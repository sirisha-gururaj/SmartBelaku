import { useEffect, useState } from "react";

import DashboardCard from "../components/DashboardCard";
import RecentComplaintsTable from "../components/RecentComplaintsTable";

import { getDashboardStats } from "../services/dashboard.service";

import {
  MdAssignment,
  MdCheckCircle,
  MdEngineering,
  MdLightbulb,
} from "react-icons/md";

interface DashboardStats {
  streetLights: number;
  complaints: number;
  pending: number;
  completed: number;
  recentComplaints: {
    id: string;
    complaint_number: string;
    citizen_name: string;
    area: string;
    status: string;
  }[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
  streetLights: 0,
  complaints: 0,
  pending: 0,
  completed: 0,
  recentComplaints: [],
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

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <DashboardCard
          title="Street Lights"
          value={stats.streetLights}
          icon={<MdLightbulb size={30} />}
          color="#0F766E"
        />

        <DashboardCard
          title="Complaints"
          value={stats.complaints}
          icon={<MdAssignment size={30} />}
          color="#F59E0B"
        />

        <DashboardCard
          title="Pending"
          value={stats.pending}
          icon={<MdEngineering size={30} />}
          color="#DC2626"
        />

        <DashboardCard
          title="Completed"
          value={stats.completed}
          icon={<MdCheckCircle size={30} />}
          color="#16A34A"
        />
      </div>

      <RecentComplaintsTable complaints={stats.recentComplaints} />
    </div>
  );
};

export default Dashboard;