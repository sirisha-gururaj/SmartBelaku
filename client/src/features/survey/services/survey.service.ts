import api from "../../../services/api";

export interface StoredLight {
  led_make: string | null;
  wattage: string | null;
}

export interface StoredPole {
  photo_url: string | null;
  latitude: string | null;
  longitude: string | null;
  pole_number: string | null;
  pole_type: string | null;
  number_of_lights: number | null;
  lights: StoredLight[];
  cb_condition: string | null;
  dedicated_street_light_line: string | null;
}

export interface Survey {
  id: string;
  surveyor_id: string;
  sl_no: string | null;
  ward: number | null;
  rr_number: string | null;
  mescom_meter_serial_number: string | null;
  zen_meter_serial_number: string | null;
  meter_photo_url: string | null;
  poles: StoredPole[];
  last_edited_by_role: "ADMIN" | "SURVEYOR" | null;
  last_edited_at: string | null;
  last_edited_by_id: string | null;
  created_at: string;
  updated_at: string;
  surveyor?: { id: string; full_name: string };
}

export interface LightFormValues {
  led_make: string;
  led_make_other: string;
  wattage: string;
  wattage_other: string;
}

export interface PoleFormValues {
  photo_url: string | null;
  latitude: string;
  longitude: string;
  pole_number: string;
  pole_type: string;
  number_of_lights: string;
  lights: LightFormValues[];
  cb_condition: string;
  dedicated_street_light_line: string;
}

export interface SurveyFormValues {
  ward: string;
  rr_number: string;
  mescom_meter_serial_number: string;
  zen_meter_serial_number: string;
  meter_photo_url: string | null;
  poles: PoleFormValues[];
}

// LED Make and Wattage each have an "Others" option — when picked, the typed
// text in the paired "_other" field is what actually gets saved.
const resolveOther = (selected: string, otherText: string) =>
  selected === "Others" && otherText.trim() ? otherText.trim() : selected;

const toFormData = (values: SurveyFormValues, photos: (File | null)[], meterPhoto: File | null) => {
  const fd = new FormData();
  fd.append("ward", values.ward);
  fd.append("rr_number", values.rr_number);
  fd.append("mescom_meter_serial_number", values.mescom_meter_serial_number);
  fd.append("zen_meter_serial_number", values.zen_meter_serial_number);
  fd.append("meter_photo_url", values.meter_photo_url ?? "");
  if (meterPhoto) fd.append("meter_photo", meterPhoto);

  const resolvedPoles = values.poles.map((p) => ({
    photo_url: p.photo_url,
    latitude: p.latitude,
    longitude: p.longitude,
    pole_number: p.pole_number,
    pole_type: p.pole_type,
    number_of_lights: p.number_of_lights,
    cb_condition: p.cb_condition,
    dedicated_street_light_line: p.dedicated_street_light_line,
    lights: p.lights.map((l) => ({
      led_make: resolveOther(l.led_make, l.led_make_other),
      wattage: resolveOther(l.wattage, l.wattage_other),
    })),
  }));
  fd.append("poles", JSON.stringify(resolvedPoles));

  // Each pole's new photo (if any) travels as its own field, named by index,
  // so the server can match it back to the right pole regardless of which
  // poles do or don't have one.
  photos.forEach((file, i) => { if (file) fd.append(`photo_${i}`, file); });

  return fd;
};

export const getMySurveys = async (): Promise<Survey[]> => {
  const res = await api.get("/surveys/mine");
  return res.data;
};

export const getAllSurveys = async (): Promise<Survey[]> => {
  const res = await api.get("/surveys");
  return res.data;
};

export const getSurveyById = async (id: string): Promise<Survey> => {
  const res = await api.get(`/surveys/${id}`);
  return res.data;
};

export const createSurvey = async (
  values: SurveyFormValues, photos: (File | null)[], meterPhoto: File | null = null
): Promise<Survey> => {
  const res = await api.post("/surveys", toFormData(values, photos, meterPhoto), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateSurvey = async (
  id: string, values: SurveyFormValues, photos: (File | null)[], meterPhoto: File | null = null
): Promise<Survey> => {
  const res = await api.patch(`/surveys/${id}`, toFormData(values, photos, meterPhoto), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
