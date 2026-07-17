import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
}

const DashboardCard = ({ title, value, icon, color }: DashboardCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6 flex justify-between items-center border gap-2">
      <div className="min-w-0">
        <p className="text-gray-500 text-xs sm:text-sm truncate">{title}</p>
        <h2 className="text-xl sm:text-3xl font-bold mt-1 sm:mt-2">{value}</h2>
      </div>

      <div
        className="h-10 w-10 sm:h-14 sm:w-14 rounded-full flex items-center justify-center text-white shrink-0"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
    </div>
  );
};

export default DashboardCard;