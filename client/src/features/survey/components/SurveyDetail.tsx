import { useState } from "react";
import type { Survey } from "../services/survey.service";
import Modal from "../../../components/ui/Modal";

interface Props {
  survey: Survey;
  onEdit: () => void;
}

const SurveyDetail = ({ survey, onEdit }: Props) => {
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between items-center gap-2 pb-4 border-b">
        {survey.last_edited_by_role === "ADMIN" ? (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Edited by Admin</span>
        ) : survey.last_edited_by_role === "SURVEYOR" ? (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Edited by Surveyor</span>
        ) : (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Not Edited</span>
        )}
        <span className="text-xs text-slate-400">Submitted {new Date(survey.created_at).toLocaleString()}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <Field label="SL No" value={survey.sl_no} />
        <Field label="Ward" value={survey.ward ? `Ward ${survey.ward}` : null} />
        <Field label="RR Number" value={survey.rr_number} />
        <Field label="Mescom Meter Serial Number" value={survey.mescom_meter_serial_number} />
        <Field label="Zen Meter Serial Number" value={survey.zen_meter_serial_number} />
        <Field label="Latitude" value={survey.latitude} />
        <Field label="Longitude" value={survey.longitude} />
        <Field label="Pole Number" value={survey.pole_number} />
        <Field label="Pole Type" value={survey.pole_type} />
        <Field label="LED Make" value={survey.led_make} />
        <Field label="Number of Lights" value={survey.number_of_lights ? String(survey.number_of_lights) : null} />
        <Field label="C & B Condition" value={survey.cb_condition} />
        <Field label="Dedicated Street Light Line" value={survey.dedicated_street_light_line} />
        <Field label="Surveyor" value={survey.surveyor?.full_name ?? null} />
      </div>

      {survey.wattages && survey.wattages.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Wattage per Light</p>
          <div className="flex flex-wrap gap-1.5">
            {survey.wattages.map((w, i) => (
              <span key={i} className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full">
                Light {i + 1}: {w || "—"}
              </span>
            ))}
          </div>
        </div>
      )}

      {survey.photo_url && (
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Photo</p>
          <button type="button" onClick={() => setShowPhotoViewer(true)} className="mt-1 block">
            <img src={survey.photo_url} alt="Survey" className="h-32 w-32 object-cover rounded-lg border hover:opacity-80 transition" />
          </button>
        </div>
      )}

      {survey.last_edited_by_role && (
        <p className={`text-xs ${survey.last_edited_by_role === "ADMIN" ? "text-amber-700" : "text-slate-500"}`}>
          Last edited by {survey.last_edited_by_role === "ADMIN" ? "Admin" : (survey.surveyor?.full_name ?? "the surveyor")}
          {survey.last_edited_at ? ` on ${new Date(survey.last_edited_at).toLocaleString()}` : ""}.
        </p>
      )}

      <div className="pt-2 border-t">
        <button onClick={onEdit} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-lg font-medium text-base">
          Edit Survey
        </button>
      </div>

      <Modal isOpen={showPhotoViewer} onClose={() => setShowPhotoViewer(false)} title="Photo" zIndexClass="z-[80]">
        {survey.photo_url && <img src={survey.photo_url} alt="Survey full size" className="w-full rounded-lg" />}
      </Modal>
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="min-w-0">
    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-slate-800 font-medium break-words">{value || "—"}</p>
  </div>
);

export default SurveyDetail;
