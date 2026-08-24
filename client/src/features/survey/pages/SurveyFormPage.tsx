import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SurveyForm from "../components/SurveyForm";
import { getSurveyById } from "../services/survey.service";
import type { Survey } from "../services/survey.service";

const SurveyFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setSurvey(await getSurveyById(id));
      } catch (e) {
        console.error(e);
        alert("Failed to load survey");
        navigate("/surveyor");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">{id ? "Edit Survey" : "New Survey"}</h1>
      <p className="text-slate-500 text-sm mb-6">
        {id ? "Update any field below — you can edit this survey anytime." : "All fields are optional — fill in what you can."}
      </p>
      <SurveyForm initial={survey ?? undefined} onSubmitted={() => navigate("/surveyor")} submitLabel={id ? "Save Changes" : "Submit Survey"} />
    </div>
  );
};

export default SurveyFormPage;
