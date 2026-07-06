import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getComplaints } from "../services/complaint.service";
import StatusBadge from "../components/ui/StatusBadge";

interface Complaint {
  id: string;
  complaint_number: string;
  citizen_name: string;
  area: string;
  status: string;
}

const Complaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    void loadComplaints();
}, []);

  const loadComplaints = async () => {
    try {
      const data = await getComplaints();
      setComplaints(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold">
            Complaints
        </h1>

        <div className="flex gap-3">

            <button
                onClick={loadComplaints}
                className="border border-teal-700 text-teal-700 px-5 py-2 rounded-lg hover:bg-teal-50"
            >
                Refresh
            </button>

            <button
                onClick={() => navigate("/complaints/new")}
                className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2 rounded-lg"
            >
                + New Complaint
            </button>

        </div>

    </div>
    <div className="flex justify-between items-center mb-5">
        <input
            type="text"
            placeholder="Search complaint..."
            className="border rounded-lg px-4 py-2 w-80"
        />
    </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">

        

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

                <td
                  colSpan={4}
                  className="text-center py-8 text-gray-500"
                >
                  No complaints found.
                </td>

              </tr>

            ) : (

              complaints.map((complaint) => (

                <tr
                  key={complaint.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="p-4">
                    {complaint.complaint_number}
                  </td>

                  <td className="p-4">
                    {complaint.citizen_name}
                  </td>

                  <td className="p-4">
                    {complaint.area}
                  </td>

                  <td className="p-4">
                    <StatusBadge status={complaint.status} />
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