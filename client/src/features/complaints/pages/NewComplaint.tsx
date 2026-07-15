import { useNavigate } from "react-router-dom";
import ComplaintForm from "../components/ComplaintForm";

const NewComplaint = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-3xl mx-auto bg-white shadow rounded-xl p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Register Complaint</h1>
      <p className="text-slate-500 text-sm mb-8">Log a complaint received by phone, field inspection, or office register.</p>
      <ComplaintForm mode="admin" onSuccess={() => navigate("/admin/complaints")} />
    </div>
  );
};

export default NewComplaint;