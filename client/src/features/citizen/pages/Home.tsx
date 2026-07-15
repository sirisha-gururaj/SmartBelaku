import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold text-slate-800 mb-3">SmartBelaku</h1>
      <p className="text-slate-500 mb-10 max-w-md">
        Report a faulty street light or check the status of a complaint you've already filed with Mangaluru City Corporation.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => navigate("/complaint/new")}
          className="bg-teal-700 text-white px-6 py-3 rounded-lg hover:bg-teal-800"
        >
          File a Complaint
        </button>
        <button
          onClick={() => navigate("/complaint/track")}
          className="border border-teal-700 text-teal-700 px-6 py-3 rounded-lg hover:bg-teal-50"
        >
          Track Complaint
        </button>
      </div>

      <button
        onClick={() => navigate("/login")}
        className="mt-16 text-sm text-slate-400 hover:text-slate-600 underline"
      >
        Staff Login
      </button>
    </div>
  );
};

export default Home;