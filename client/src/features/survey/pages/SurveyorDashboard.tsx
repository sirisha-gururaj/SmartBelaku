import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMySurveys, deleteSurvey } from "../services/survey.service";
import type { Survey } from "../services/survey.service";
import { exportSurveysToCsv } from "../utils/csv";

const SurveyorDashboard = () => {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { setSurveys(await getMySurveys()); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this survey? It will be removed from your list.")) return;
    setDeletingId(id);
    try {
      await deleteSurvey(id);
      await load();
    } catch (err) {
      console.error(err);
      alert("Failed to delete survey");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Surveys</h1>
          <p className="text-slate-500 text-sm mt-1">Street light survey entries you've submitted.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex-1 sm:flex-none border border-teal-700 text-teal-700 px-4 py-2 rounded-lg hover:bg-teal-50 text-sm">Refresh</button>
          <button
            onClick={() => exportSurveysToCsv(surveys, `my-surveys-${new Date().toISOString().slice(0, 10)}.csv`)}
            disabled={surveys.length === 0}
            className="flex-1 sm:flex-none border border-teal-700 text-teal-700 px-4 py-2 rounded-lg hover:bg-teal-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            Export CSV
          </button>
          <button onClick={() => navigate("/surveyor/new")} className="flex-1 sm:flex-none bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-sm">+ New Survey</button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : surveys.length === 0 ? (
        <div className="bg-white rounded-xl shadow border p-8 sm:p-12 text-center text-slate-500">No surveys submitted yet.</div>
      ) : (
        <div className="grid gap-3">
          {surveys.map((s) => (
            <div key={s.id} onClick={() => navigate(`/surveyor/${s.id}`)} className="bg-white rounded-xl shadow border p-4 text-left hover:border-teal-600 active:bg-slate-50 transition cursor-pointer">
              <div className="flex justify-between items-start gap-2 mb-1">
                <span className="font-medium text-slate-800">{s.rr_number || "Untitled entry"}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {s.last_edited_by_role === "ADMIN" && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Edited by admin</span>
                  )}
                  {s.last_edited_by_role === "SURVEYOR" && (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">Edited by you</span>
                  )}
                  <button
                    onClick={(e) => handleDelete(e, s.id)}
                    disabled={deletingId === s.id}
                    className="text-xs text-red-600 hover:underline disabled:opacity-50"
                  >
                    {deletingId === s.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {s.ward ? `Ward ${s.ward} · ` : ""}{s.poles.length} pole{s.poles.length === 1 ? "" : "s"} · {new Date(s.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SurveyorDashboard;
