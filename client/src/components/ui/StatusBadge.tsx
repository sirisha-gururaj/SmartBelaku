interface StatusBadgeProps {
  status: string;
}

const colors: Record<string, string> = {
  NEW: "bg-yellow-100 text-yellow-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  ASSIGNED: "bg-indigo-100 text-indigo-800",
  IN_PROGRESS: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-green-100 text-green-800",
  VERIFIED: "bg-emerald-100 text-emerald-800",
  CLOSED: "bg-gray-200 text-gray-800",
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        colors[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
};

export default StatusBadge;