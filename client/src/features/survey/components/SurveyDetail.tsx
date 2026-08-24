import { useState } from "react";
import type { Survey } from "../services/survey.service";
import Modal from "../../../components/ui/Modal";

interface Props {
  survey: Survey;
  onEdit: () => void;
  onDelete?: () => void;
}

const SurveyDetail = ({ survey, onEdit, onDelete }: Props) => {
  const [viewerPhotoUrl, setViewerPhotoUrl] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between items-center gap-2 pb-4 border-b">
        <div className="flex flex-wrap items-center gap-2">
          {survey.deleted_by_surveyor && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Deleted by Surveyor</span>
          )}
          {survey.last_edited_by_role === "ADMIN" ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Edited by Admin</span>
          ) : survey.last_edited_by_role === "SURVEYOR" ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Edited by Surveyor</span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Not Edited</span>
          )}
        </div>
        <span className="text-xs text-slate-400">Submitted {new Date(survey.created_at).toLocaleString()}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <Field label="SL No" value={survey.sl_no} />
        <Field label="Ward" value={survey.ward ? `Ward ${survey.ward}` : null} />
        <Field label="RR Number" value={survey.rr_number} />
        <Field label="Mescom Meter Serial Number" value={survey.mescom_meter_serial_number} />
        <Field label="Zen Meter Serial Number" value={survey.zen_meter_serial_number} />
        <Field label="Surveyor" value={survey.surveyor?.full_name ?? null} />
      </div>

      {survey.meter_photo_url && (
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Meter Photo</p>
          <button type="button" onClick={() => setViewerPhotoUrl(survey.meter_photo_url)} className="mt-1 block">
            <img src={survey.meter_photo_url} alt="Meter" className="h-32 w-32 object-cover rounded-lg border hover:opacity-80 transition" />
          </button>
        </div>
      )}

      <div className="pt-2 border-t">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
          Poles ({survey.poles.length})
        </p>

        {survey.poles.length === 0 ? (
          <p className="text-sm text-slate-400">No poles recorded.</p>
        ) : (
          <div className="space-y-4">
            {survey.poles.map((pole, i) => (
              <div key={i} className="border rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-teal-700">Pole {i + 1}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <Field label="Pole Number" value={pole.pole_number} />
                  <Field label="Pole Type" value={pole.pole_type} />
                  <Field label="Latitude" value={pole.latitude} />
                  <Field label="Longitude" value={pole.longitude} />
                  <Field label="Number of Lights" value={pole.number_of_lights ? String(pole.number_of_lights) : null} />
                  <Field label="C & B Condition" value={pole.cb_condition} />
                  <Field label="Dedicated Street Light Line" value={pole.dedicated_street_light_line} />
                </div>

                {pole.lights && pole.lights.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Lights</p>
                    <div className="flex flex-wrap gap-1.5">
                      {pole.lights.map((l, li) => (
                        <span key={li} className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full">
                          Light {li + 1}: {l.led_make || "—"} / {l.wattage || "—"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {pole.photo_url && (
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Photo</p>
                    <button type="button" onClick={() => setViewerPhotoUrl(pole.photo_url)} className="mt-1 block">
                      <img src={pole.photo_url} alt={`Pole ${i + 1}`} className="h-32 w-32 object-cover rounded-lg border hover:opacity-80 transition" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {survey.last_edited_by_role && (
        <p className={`text-xs ${survey.last_edited_by_role === "ADMIN" ? "text-amber-700" : "text-slate-500"}`}>
          Last edited by {survey.last_edited_by_role === "ADMIN" ? "Admin" : (survey.surveyor?.full_name ?? "the surveyor")}
          {survey.last_edited_at ? ` on ${new Date(survey.last_edited_at).toLocaleString()}` : ""}.
        </p>
      )}

      <div className="pt-2 border-t space-y-2">
        <button onClick={onEdit} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-lg font-medium text-base">
          Edit Survey
        </button>
        {onDelete && (
          <button onClick={onDelete} className="w-full border border-red-300 text-red-600 hover:bg-red-50 py-3 rounded-lg font-medium text-base">
            Delete Survey
          </button>
        )}
      </div>

      <Modal isOpen={!!viewerPhotoUrl} onClose={() => setViewerPhotoUrl(null)} title="Photo" zIndexClass="z-[80]">
        {viewerPhotoUrl && <img src={viewerPhotoUrl} alt="Survey full size" className="w-full rounded-lg" />}
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
