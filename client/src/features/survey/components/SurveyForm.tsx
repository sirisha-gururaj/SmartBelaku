import { useRef, useState, useEffect } from "react";
import type { Survey, SurveyFormValues, PoleFormValues, LightFormValues, StoredPole } from "../services/survey.service";
import { WARDS, POLE_TYPES, LED_MAKES, WATTAGES, CB_CONDITIONS, YES_NO } from "../constants";
import Modal from "../../../components/ui/Modal";

const emptyLight = (): LightFormValues => ({ led_make: "", led_make_other: "", wattage: "", wattage_other: "" });

const emptyPole = (poleNumber = ""): PoleFormValues => ({
  photo_url: null, latitude: "", longitude: "", pole_number: poleNumber, pole_type: "",
  number_of_lights: "", lights: [], cb_condition: "", dedicated_street_light_line: "",
});

// A brand new form always starts its pole numbering at P1, regardless of any
// other survey submitted before it.
const emptyValues: SurveyFormValues = {
  ward: "", rr_number: "", mescom_meter_serial_number: "", zen_meter_serial_number: "",
  meter_photo_url: null, poles: [emptyPole("P1")],
};

// A stored value that isn't one of the known dropdown options means it was typed
// in via "Others" — reconstruct the (select, typed text) pair so editing shows
// "Others" selected with the original text still sitting in the box below it.
const splitOther = (value: string | null, knownValues: readonly string[]): [string, string] => {
  if (!value) return ["", ""];
  return knownValues.includes(value) ? [value, ""] : ["Others", value];
};

const toPoleFormValues = (p: StoredPole): PoleFormValues => ({
  photo_url: p.photo_url,
  latitude: p.latitude ?? "",
  longitude: p.longitude ?? "",
  pole_number: p.pole_number ?? "",
  pole_type: p.pole_type ?? "",
  number_of_lights: p.number_of_lights ? String(p.number_of_lights) : "",
  lights: (p.lights ?? []).map((l) => {
    const [led_make, led_make_other] = splitOther(l.led_make, LED_MAKES);
    const [wattage, wattage_other] = splitOther(l.wattage, WATTAGES);
    return { led_make, led_make_other, wattage, wattage_other };
  }),
  cb_condition: p.cb_condition ?? "",
  dedicated_street_light_line: p.dedicated_street_light_line ?? "",
});

const toFormValues = (s: Survey): SurveyFormValues => ({
  ward: s.ward ? String(s.ward) : "",
  rr_number: s.rr_number ?? "",
  mescom_meter_serial_number: s.mescom_meter_serial_number ?? "",
  zen_meter_serial_number: s.zen_meter_serial_number ?? "",
  meter_photo_url: s.meter_photo_url,
  poles: s.poles && s.poles.length > 0 ? s.poles.map(toPoleFormValues) : [emptyPole()],
});

interface Props {
  initial?: Survey;
  onSubmit: (values: SurveyFormValues, photos: (File | null)[], meterPhoto: File | null) => Promise<void>;
  submitLabel?: string;
}

// Camera capture is shared by every photo slot in the form (the meter photo
// plus one per pole) — this says which slot is currently being captured for.
type CameraTarget = number | "meter" | null;

const SurveyForm = ({ initial, onSubmit, submitLabel = "Save Survey" }: Props) => {
  const [values, setValues] = useState<SurveyFormValues>(initial ? toFormValues(initial) : emptyValues);
  const [photos, setPhotos] = useState<(File | null)[]>(() => values.poles.map(() => null));
  const [meterPhoto, setMeterPhoto] = useState<File | null>(null);
  const [locatingIndex, setLocatingIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cameraTarget, setCameraTarget] = useState<CameraTarget>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [viewerPhotoUrl, setViewerPhotoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // "P1", "P2", ... — a plain per-form counter for suggesting each new pole's
  // number. Starts after however many poles this form already has (1 for a
  // brand new form, since that first pole is already "P1").
  const nextPoleNumberRef = useRef((initial?.poles.length ?? 1) + 1);

  const update = (key: keyof Omit<SurveyFormValues, "poles" | "meter_photo_url">, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const updatePole = (index: number, key: keyof Omit<PoleFormValues, "lights" | "photo_url">, value: string) => {
    setValues((prev) => ({
      ...prev,
      poles: prev.poles.map((p, i) => (i === index ? { ...p, [key]: value } : p)),
    }));
  };

  const addPole = () => {
    const suggested = nextPoleNumberRef.current;
    nextPoleNumberRef.current = suggested + 1;
    setValues((prev) => ({ ...prev, poles: [...prev.poles, emptyPole(`P${suggested}`)] }));
    setPhotos((prev) => [...prev, null]);
  };

  const removePole = (index: number) => {
    setValues((prev) => ({ ...prev, poles: prev.poles.filter((_, i) => i !== index) }));
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePoleLightsCountChange = (poleIndex: number, value: string) => {
    const n = value ? Number(value) : 0;
    setValues((prev) => ({
      ...prev,
      poles: prev.poles.map((p, i) => {
        if (i !== poleIndex) return p;
        const lights = Array.from({ length: n }, (_, li) => p.lights[li] ?? emptyLight());
        return { ...p, number_of_lights: value, lights };
      }),
    }));
  };

  const updateLight = (poleIndex: number, lightIndex: number, key: keyof LightFormValues, value: string) => {
    setValues((prev) => ({
      ...prev,
      poles: prev.poles.map((p, i) => {
        if (i !== poleIndex) return p;
        const lights = p.lights.map((l, li) => (li === lightIndex ? { ...l, [key]: value } : l));
        return { ...p, lights };
      }),
    }));
  };

  const handlePhotoChange = (poleIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setPhotos((prev) => prev.map((f, i) => (i === poleIndex ? file : f)));
    const previewUrl = URL.createObjectURL(file);
    setValues((prev) => ({
      ...prev,
      poles: prev.poles.map((p, i) => (i === poleIndex ? { ...p, photo_url: previewUrl } : p)),
    }));
  };

  const handleMeterPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setMeterPhoto(file);
    setValues((prev) => ({ ...prev, meter_photo_url: URL.createObjectURL(file) }));
  };

  const handleUseLocation = (poleIndex: number) => {
    if (!navigator.geolocation) {
      setError("Location is not supported on this device");
      return;
    }
    setLocatingIndex(poleIndex);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updatePole(poleIndex, "latitude", String(pos.coords.latitude));
        updatePole(poleIndex, "longitude", String(pos.coords.longitude));
        setLocatingIndex(null);
      },
      () => {
        setError("Could not get current location");
        setLocatingIndex(null);
      }
    );
  };

  // Live webcam capture — a plain <input type="file"> never offers a camera
  // option on desktop (only mobile browsers do that in their file chooser),
  // so this gives an explicit "take a photo right now" path on every device.
  // One shared modal serves whichever slot last asked for it (cameraTarget).
  useEffect(() => {
    if (cameraTarget === null) return;

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
        setCameraTarget(null);
      });

    return () => {
      cancelled = true;
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [cameraTarget]);

  const openCamera = (target: CameraTarget) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access isn't supported in this browser. Please upload a photo instead.");
      return;
    }
    setCameraError(null);
    setCameraTarget(target);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || cameraTarget === null) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const target = cameraTarget;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `survey-photo-${Date.now()}.jpg`, { type: "image/jpeg" });
      const previewUrl = URL.createObjectURL(file);

      if (target === "meter") {
        setMeterPhoto(file);
        setValues((prev) => ({ ...prev, meter_photo_url: previewUrl }));
      } else {
        setPhotos((prev) => prev.map((f, i) => (i === target ? file : f)));
        setValues((prev) => ({
          ...prev,
          poles: prev.poles.map((p, i) => (i === target ? { ...p, photo_url: previewUrl } : p)),
        }));
      }
      setCameraTarget(null);
    }, "image/jpeg", 0.9);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values, photos, meterPhoto);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save survey");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full border rounded-lg p-3 text-base focus:ring-2 focus:ring-teal-600 focus:outline-none";
  const selectSmClass = "w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}

      {initial?.sl_no && (
        <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
          SL No: <span className="font-medium text-slate-800">{initial.sl_no}</span>
        </div>
      )}

      {initial?.last_edited_by_role === "ADMIN" && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-3">
          Edited by admin{initial.last_edited_at ? ` on ${new Date(initial.last_edited_at).toLocaleString()}` : ""}.
        </div>
      )}

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

      <Field label="Meter Photo">
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex items-center border rounded-lg px-3 py-2 text-sm text-slate-700 cursor-pointer hover:border-teal-600">
            Upload a Photo
            <input type="file" accept="image/*" onChange={handleMeterPhotoChange} className="hidden" />
          </label>
          <button type="button" onClick={() => openCamera("meter")} className="border rounded-lg px-3 py-2 text-sm text-teal-700 hover:border-teal-600">
            📷 Open Camera
          </button>
        </div>
        {cameraError && cameraTarget === null && <p className="text-red-600 text-xs mt-1">{cameraError}</p>}
        {values.meter_photo_url && (
          <button type="button" onClick={() => setViewerPhotoUrl(values.meter_photo_url)} className="mt-2 block">
            <img src={values.meter_photo_url} alt="Meter" className="h-32 w-32 object-cover rounded-lg border hover:opacity-80 transition" />
          </button>
        )}
      </Field>

      <div className="pt-2 border-t">
        <h3 className="font-semibold text-slate-800 mb-3">Poles</h3>

        <div className="space-y-5">
          {values.poles.map((pole, poleIndex) => (
            <div key={poleIndex} className="border-2 border-slate-200 rounded-xl p-4 space-y-4 relative">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-teal-700">Pole {poleIndex + 1}</span>
                {values.poles.length > 1 && (
                  <button type="button" onClick={() => removePole(poleIndex)} className="text-xs text-red-600 hover:underline">
                    Remove pole
                  </button>
                )}
              </div>

              <Field label="Photo">
                <div className="flex flex-wrap gap-2">
                  {/* No `capture` attribute — that forces the camera straight open on
                      mobile. Leaving it off lets the browser's own chooser offer both
                      "Take Photo" and "Choose from Gallery/Files" there. */}
                  <label className="inline-flex items-center border rounded-lg px-3 py-2 text-sm text-slate-700 cursor-pointer hover:border-teal-600">
                    Upload a Photo
                    <input type="file" accept="image/*" onChange={(e) => handlePhotoChange(poleIndex, e)} className="hidden" />
                  </label>
                  <button type="button" onClick={() => openCamera(poleIndex)} className="border rounded-lg px-3 py-2 text-sm text-teal-700 hover:border-teal-600">
                    📷 Open Camera
                  </button>
                </div>
                {cameraError && cameraTarget === null && <p className="text-red-600 text-xs mt-1">{cameraError}</p>}

                {pole.photo_url && (
                  <button type="button" onClick={() => setViewerPhotoUrl(pole.photo_url)} className="mt-2 block">
                    <img
                      src={pole.photo_url}
                      alt={`Pole ${poleIndex + 1}`}
                      className="h-32 w-32 object-cover rounded-lg border hover:opacity-80 transition"
                    />
                  </button>
                )}
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Latitude">
                  <input value={pole.latitude} onChange={(e) => updatePole(poleIndex, "latitude", e.target.value)} className={inputClass} inputMode="decimal" />
                </Field>
                <Field label="Longitude">
                  <input value={pole.longitude} onChange={(e) => updatePole(poleIndex, "longitude", e.target.value)} className={inputClass} inputMode="decimal" />
                </Field>
              </div>
              <button type="button" onClick={() => handleUseLocation(poleIndex)} disabled={locatingIndex === poleIndex} className="text-sm text-teal-700 hover:underline">
                {locatingIndex === poleIndex ? "Locating..." : "📍 Use my current location"}
              </button>

              <Field label="Pole Number">
                <input value={pole.pole_number} onChange={(e) => updatePole(poleIndex, "pole_number", e.target.value)} className={inputClass} placeholder="Auto-generated — tap to edit" />
              </Field>

              <Field label="Pole Type">
                <select value={pole.pole_type} onChange={(e) => updatePole(poleIndex, "pole_type", e.target.value)} className={inputClass}>
                  <option value="">— Not specified —</option>
                  {POLE_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>

              <Field label="Number of Lights">
                <select value={pole.number_of_lights} onChange={(e) => handlePoleLightsCountChange(poleIndex, e.target.value)} className={inputClass}>
                  <option value="">— Not specified —</option>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </Field>

              {pole.lights.length > 0 && (
                <div className="space-y-3 pl-3 border-l-2 border-teal-100">
                  {pole.lights.map((light, lightIndex) => (
                    <div key={lightIndex} className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Light {lightIndex + 1} — LED Make</label>
                        <select value={light.led_make} onChange={(e) => updateLight(poleIndex, lightIndex, "led_make", e.target.value)} className={selectSmClass}>
                          <option value="">— Not specified —</option>
                          {LED_MAKES.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                        {light.led_make === "Others" && (
                          <input
                            value={light.led_make_other}
                            onChange={(e) => updateLight(poleIndex, lightIndex, "led_make_other", e.target.value)}
                            placeholder="Type the LED make"
                            className={`${selectSmClass} mt-2`}
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Light {lightIndex + 1} — Wattage</label>
                        <select value={light.wattage} onChange={(e) => updateLight(poleIndex, lightIndex, "wattage", e.target.value)} className={selectSmClass}>
                          <option value="">— Not specified —</option>
                          {WATTAGES.map((w) => <option key={w} value={w}>{w}</option>)}
                        </select>
                        {light.wattage === "Others" && (
                          <input
                            value={light.wattage_other}
                            onChange={(e) => updateLight(poleIndex, lightIndex, "wattage_other", e.target.value)}
                            placeholder="Type the wattage"
                            className={`${selectSmClass} mt-2`}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Field label="C & B Condition">
                <select value={pole.cb_condition} onChange={(e) => updatePole(poleIndex, "cb_condition", e.target.value)} className={inputClass}>
                  <option value="">— Not specified —</option>
                  {CB_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              <Field label="Dedicated Street Light Line">
                <select value={pole.dedicated_street_light_line} onChange={(e) => updatePole(poleIndex, "dedicated_street_light_line", e.target.value)} className={inputClass}>
                  <option value="">— Not specified —</option>
                  {YES_NO.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </Field>
            </div>
          ))}
        </div>

        <button type="button" onClick={addPole} className="mt-4 w-full border-2 border-dashed border-teal-300 text-teal-700 rounded-xl py-3 text-sm font-medium hover:bg-teal-50">
          + Add Pole
        </button>
      </div>

      <Modal isOpen={cameraTarget !== null} onClose={() => setCameraTarget(null)} title="Take a Photo" zIndexClass="z-[80]">
        <div className="space-y-3">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg bg-black" />
          <canvas ref={canvasRef} className="hidden" />
          <button type="button" onClick={capturePhoto} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-2.5 rounded-lg font-medium text-base">
            Capture
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!viewerPhotoUrl} onClose={() => setViewerPhotoUrl(null)} title="Photo" zIndexClass="z-[80]">
        {viewerPhotoUrl && <img src={viewerPhotoUrl} alt="Survey full size" className="w-full rounded-lg" />}
      </Modal>

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
