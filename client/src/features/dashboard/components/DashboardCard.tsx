import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
}

const DashboardCard = ({
  title,
  value,
  icon,
  color,
}: DashboardCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center border">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>

        <h2 className="text-3xl font-bold mt-2">{value}</h2>
      </div>

      <div
        className="h-14 w-14 rounded-full flex items-center justify-center text-white"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
    </div>
  );
};

export default DashboardCard;