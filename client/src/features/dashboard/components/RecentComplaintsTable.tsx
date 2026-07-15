import StatusBadge from "../../complaints/components/StatusBadge";

interface Complaint {
  id: string;
  complaint_number: string;
  citizen_name: string;
  area: string;
  status: string;
}

interface Props {
  complaints: Complaint[];
}

const RecentComplaintsTable = ({ complaints }: Props) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border mt-8">
      <div className="p-5 border-b">
        <h2 className="text-xl font-semibold">
          Recent Complaints
        </h2>
      </div>

      <table className="w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="text-left p-4">Complaint No</th>
            <th className="text-left p-4">Citizen</th>
            <th className="text-left p-4">Area</th>
            <th className="text-left p-4">Status</th>
          </tr>
        </thead>

        <tbody>
          {complaints.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-8 text-gray-500">
                No recent complaints.
              </td>
            </tr>
          ) : (
            complaints.map((complaint) => (
              <tr key={complaint.id} className="border-t hover:bg-slate-50">
                <td className="p-4">{complaint.complaint_number}</td>
                <td className="p-4">{complaint.citizen_name}</td>
                <td className="p-4">{complaint.area}</td>
                <td className="p-4">
                  <StatusBadge status={complaint.status} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RecentComplaintsTable;