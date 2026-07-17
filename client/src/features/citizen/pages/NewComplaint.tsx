import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ComplaintForm from "../../complaints/components/ComplaintForm";

const NewComplaint = () => {
  const navigate = useNavigate();
  const [submittedNumber, setSubmittedNumber] = useState<string | null>(null);

  if (submittedNumber) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-md text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Complaint Registered</h1>
          <p className="text-slate-500 mb-6 text-sm sm:text-base">Save this number to track your complaint status.</p>
          <div className="bg-teal-50 border border-teal-200 rounded-lg py-4 mb-6">
            <span className="text-xl sm:text-2xl font-mono font-bold text-teal-700 break-all px-2">{submittedNumber}</span>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate("/complaint/track")} className="bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-lg text-base">
              Track This Complaint
            </button>
            <button onClick={() => navigate("/")} className="text-slate-500 hover:text-slate-700 text-sm underline">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-5 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">Report a Street Light Issue</h1>
        <p className="text-slate-500 text-sm mb-6 sm:mb-8">Fields marked <span className="text-red-500">*</span> are required.</p>
        <ComplaintForm mode="citizen" onSuccess={setSubmittedNumber} />
      </div>
    </div>
  );
};

export default NewComplaint;