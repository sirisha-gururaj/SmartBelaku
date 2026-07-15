import { useNavigate } from "react-router-dom";
import ComplaintForm from "../../complaints/components/ComplaintForm";

const NewComplaint = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Log a Complaint</h1>
      <p className="text-slate-500 text-sm mb-8">For issues found during field inspection.</p>
      <ComplaintForm mode="citizen" onSuccess={() => navigate("/mslvl")} />
    </div>
  );
};

export default NewComplaint;