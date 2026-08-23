import { useEffect, useRef, useState } from "react";
import type { Survey, SurveyFormValues } from "../services/survey.service";
import { WARDS, POLE_TYPES, LED_MAKES, WATTAGES, CB_CONDITIONS, YES_NO, LIGHT_COUNTS } from "../constants";
import Modal from "../../../components/ui/Modal";

const emptyValues: SurveyFormValues = {
  sl_no: "", ward: "", rr_number: "", mescom_meter_serial_number: "", zen_meter_serial_number: "",
  latitude: "", longitude: "", pole_number: "", pole_type: "", led_make: "", led_make_other: "",
  number_of_lights: "", wattages: [], wattages_other: [],
  cb_condition: "", dedicated_street_light_line: "",
};

// A stored value that isn't one of the known dropdown options means it was typed
// in via "Others" — reconstruct the (select, typed text) pair so editing shows
// "Others" selected with the original text still sitting in the box below it.
const splitOther = (value: string | null, knownValues: readonly string[]): [string, string] => {
  if (!value) return ["", ""];
  return knownValues.includes(value) ? [value, ""] : ["Others", value];
};

const toFormValues = (s: Survey): SurveyFormValues => {
  const [led_make, led_make_other] = splitOther(s.led_make, LED_MAKES);
  const wattages: string[] = [];
  const wattages_other: string[] = [];
  (s.wattages ?? []).forEach((w) => {
    const [select, other] = splitOther(w, WATTAGES);
    wattages.push(select);
    wattages_other.push(other);
  });

  return {
    sl_no: s.sl_no ?? "",
    ward: s.ward ? String(s.ward) : "",
    rr_number: s.rr_number ?? "",
    mescom_meter_serial_number: s.mescom_meter_serial_number ?? "",
    zen_meter_serial_number: s.zen_meter_serial_number ?? "",
    latitude: s.latitude ?? "",
    longitude: s.longitude ?? "",
    pole_number: s.pole_number ?? "",
    pole_type: s.pole_type ?? "",
    led_make, led_make_other,
    number_of_lights: s.number_of_lights ? String(s.number_of_lights) : "",
    wattages, wattages_other,
    cb_condition: s.cb_condition ?? "",
    dedicated_street_light_line: s.dedicated_street_light_line ?? "",
  };
};

interface Props {
  initial?: Survey;
  onSubmit: (values: SurveyFormValues, photo: File | null) => Promise<void>;
  submitLabel?: string;
}

const SurveyForm = ({ initial, onSubmit, submitLabel = "Save Survey" }: Props) => {
  const [values, setValues] = useState<SurveyFormValues>(initial ? toFormValues(initial) : emptyValues);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initial?.photo_url ?? null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const update = (key: Exclude<keyof SurveyFormValues, "wattages" | "wattages_other">, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleLightsCountChange = (value: string) => {
    const n = value ? Number(value) : 0;
    setValues((prev) => ({
      ...prev,
      number_of_lights: value,
      wattages: Array.from({ length: n }, (_, i) => prev.wattages[i] ?? ""),
      wattages_other: Array.from({ length: n }, (_, i) => prev.wattages_other[i] ?? ""),
    }));
  };

  const updateWattageAt = (index: number, value: string) => {
    setValues((prev) => {
      const wattages = [...prev.wattages];
      wattages[index] = value;
      return { ...prev, wattages };
    });
  };

  const updateWattageOtherAt = (index: number, value: string) => {
    setValues((prev) => {
      const wattages_other = [...prev.wattages_other];
      wattages_other[index] = value;
      return { ...prev, wattages_other };
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhoto(file);
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  // Live webcam capture — a plain <input type="file"> never offers a camera
  // option on desktop (only mobile browsers do that in their file chooser),
  // so this gives an explicit "take a photo right now" path on every device.
  useEffect(() => {
    if (!showCamera) return;

    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        setCameraError("Could not access the camera. Check browser/site permissions, or use Upload instead.");
        setShowCamera(false);
      });

    return () => {
      cancelled = true;
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [showCamera]);

  const openCamera = () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access isn't supported in this browser. Please upload a photo instead.");
      return;
    }
    setCameraError(null);
    setShowCamera(true);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `survey-photo-${Date.now()}.jpg`, { type: "image/jpeg" });
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setShowCamera(false);
    }, "image/jpeg", 0.9);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError("Location is not supported on this device");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update("latitude", String(pos.coords.latitude));
        update("longitude", String(pos.coords.longitude));
        setLocating(false);
      },
      () => {
        setError("Could not get current location");
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values, photo);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save survey");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full border rounded-lg p-3 text-base focus:ring-2 focus:ring-teal-600 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}

      {initial?.last_edited_by_role === "ADMIN" && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-3">
          Edited by admin{initial.last_edited_at ? ` on ${new Date(initial.last_edited_at).toLocaleString()}` : ""}.
        </div>
      )}

      <Field label="SL No">
        <input value={values.sl_no} onChange={(e) => update("sl_no", e.target.value)} className={inputClass} placeholder="Serial number" />
      </Field>

      <Field label="Ward">
        <select value={values.ward} onChange={(e) => update("ward", e.target.value)} className={inputClass}>
          <option value="">— Not specified —</option>
          {WARDS.map((w) => <option key={w} value={w}>Ward {w}</option>)}
        </select>
      </Field>

      <Field label="RR Number">
        <input value={values.rr_number} onChange={(e) => update("rr_number", e.target.value)} className={inputClass} />
      </Field>

      <Field label="Mescom Meter Serial Number">
        <input value={values.mescom_meter_serial_number} onChange={(e) => update("mescom_meter_serial_number", e.target.value)} className={inputClass} />
      </Field>

      <Field label="Zen Meter Serial Number">
        <input value={values.zen_meter_serial_number} onChange={(e) => update("zen_meter_serial_number", e.target.value)} className={inputClass} />
      </Field>

      <Field label="Photo">
        <div className="flex flex-wrap gap-2">
          {/* No `capture` attribute — that forces the camera straight open on
              mobile. Leaving it off lets the browser's own chooser offer both
              "Take Photo" and "Choose from Gallery/Files" there. */}
          <label className="inline-flex items-center border rounded-lg px-3 py-2 text-sm text-slate-700 cursor-pointer hover:border-teal-600">
            Upload a Photo
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </label>
          <button type="button" onClick={openCamera} className="border rounded-lg px-3 py-2 text-sm text-teal-700 hover:border-teal-600">
            📷 Open Camera
          </button>
        </div>
        {cameraError && <p className="text-red-600 text-xs mt-1">{cameraError}</p>}

        {photoPreview && (
          <button type="button" onClick={() => setShowPhotoViewer(true)} className="mt-2 block">
            <img
              src={photoPreview}
              alt="Survey"
              className="h-32 w-32 object-cover rounded-lg border hover:opacity-80 transition"
            />
          </button>
        )}
      </Field>

      <Modal isOpen={showCamera} onClose={() => setShowCamera(false)} title="Take a Photo" zIndexClass="z-[80]">
        <div className="space-y-3">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg bg-black" />
          <canvas ref={canvasRef} className="hidden" />
          <button type="button" onClick={capturePhoto} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-2.5 rounded-lg font-medium text-base">
            Capture
          </button>
        </div>
      </Modal>

      <Modal isOpen={showPhotoViewer} onClose={() => setShowPhotoViewer(false)} title="Photo" zIndexClass="z-[80]">
        {photoPreview && <img src={photoPreview} alt="Survey full size" className="w-full rounded-lg" />}
      </Modal>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Latitude">
          <input value={values.latitude} onChange={(e) => update("latitude", e.target.value)} className={inputClass} inputMode="decimal" />
        </Field>
        <Field label="Longitude">
          <input value={values.longitude} onChange={(e) => update("longitude", e.target.value)} className={inputClass} inputMode="decimal" />
        </Field>
      </div>
      <button type="button" onClick={handleUseLocation} disabled={locating} className="text-sm text-teal-700 hover:underline">
        {locating ? "Locating..." : "📍 Use my current location"}
      </button>

      <Field label="Pole Number">
        <input value={values.pole_number} onChange={(e) => update("pole_number", e.target.value)} className={inputClass} />
      </Field>

      <Field label="Pole Type">
        <select value={values.pole_type} onChange={(e) => update("pole_type", e.target.value)} className={inputClass}>
          <option value="">— Not specified —</option>
          {POLE_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </Field>

      <Field label="LED Make">
        <select value={values.led_make} onChange={(e) => update("led_make", e.target.value)} className={inputClass}>
          <option value="">— Not specified —</option>
          {LED_MAKES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        {values.led_make === "Others" && (
          <input
            value={values.led_make_other}
            onChange={(e) => update("led_make_other", e.target.value)}
            placeholder="Type the LED make"
            className={`${inputClass} mt-2`}
          />
        )}
      </Field>

      <Field label="Number of Lights">
        <select value={values.number_of_lights} onChange={(e) => handleLightsCountChange(e.target.value)} className={inputClass}>
          <option value="">— Not specified —</option>
          {LIGHT_COUNTS.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </Field>

      {values.wattages.length > 0 && (
        <div className="space-y-3 pl-3 border-l-2 border-teal-100">
          {values.wattages.map((w, i) => (
            <Field key={i} label={`Wattage — Light ${i + 1}`}>
              <select value={w} onChange={(e) => updateWattageAt(i, e.target.value)} className={inputClass}>
                <option value="">— Not specified —</option>
                {WATTAGES.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {w === "Others" && (
                <input
                  value={values.wattages_other[i] ?? ""}
                  onChange={(e) => updateWattageOtherAt(i, e.target.value)}
                  placeholder="Type the wattage"
                  className={`${inputClass} mt-2`}
                />
              )}
            </Field>
          ))}
        </div>
      )}

      <Field label="C & B Condition">
        <select value={values.cb_condition} onChange={(e) => update("cb_condition", e.target.value)} className={inputClass}>
          <option value="">— Not specified —</option>
          {CB_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>

      <Field label="Dedicated Street Light Line">
        <select value={values.dedicated_street_light_line} onChange={(e) => update("dedicated_street_light_line", e.target.value)} className={inputClass}>
          <option value="">— Not specified —</option>
          {YES_NO.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </Field>

      <button type="submit" disabled={submitting} className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white py-3 rounded-lg font-medium text-base">
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    {children}
  </div>
);

export default SurveyForm;
