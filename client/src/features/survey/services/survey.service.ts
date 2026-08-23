import api from "../../../services/api";

export interface Survey {
  id: string;
  surveyor_id: string;
  sl_no: string | null;
  ward: number | null;
  rr_number: string | null;
  mescom_meter_serial_number: string | null;
  zen_meter_serial_number: string | null;
  photo_url: string | null;
  latitude: string | null;
  longitude: string | null;
  pole_number: string | null;
  pole_type: string | null;
  led_make: string | null;
  number_of_lights: number | null;
  wattages: string[] | null;
  cb_condition: string | null;
  dedicated_street_light_line: string | null;
  last_edited_by_role: "ADMIN" | "SURVEYOR" | null;
  last_edited_at: string | null;
  last_edited_by_id: string | null;
  created_at: string;
  updated_at: string;
  surveyor?: { id: string; full_name: string };
}

export interface SurveyFormValues {
  sl_no: string;
  ward: string;
  rr_number: string;
  mescom_meter_serial_number: string;
  zen_meter_serial_number: string;
  latitude: string;
  longitude: string;
  pole_number: string;
  pole_type: string;
  led_make: string;
  led_make_other: string;
  number_of_lights: string;
  wattages: string[];
  wattages_other: string[];
  cb_condition: string;
  dedicated_street_light_line: string;
}

// LED Make and each per-light Wattage have an "Others" option — when picked, the
// typed text in the paired "_other" field is what actually gets saved.
const resolveOther = (selected: string, otherText: string) =>
  selected === "Others" && otherText.trim() ? otherText.trim() : selected;

const toFormData = (values: SurveyFormValues, photo?: File | null) => {
  const fd = new FormData();
  const { wattages, wattages_other, led_make, led_make_other, ...rest } = values;
  (Object.entries(rest) as [string, string][]).forEach(([key, value]) => fd.append(key, value ?? ""));

  fd.append("led_make", resolveOther(led_make, led_make_other));

  // FormData can't carry arrays directly — send the resolved per-light wattage list as JSON.
  const resolvedWattages = wattages.map((w, i) => resolveOther(w, wattages_other[i] ?? ""));
  fd.append("wattages", JSON.stringify(resolvedWattages));

  if (photo) fd.append("photo", photo);
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

export const createSurvey = async (values: SurveyFormValues, photo?: File | null): Promise<Survey> => {
  const res = await api.post("/surveys", toFormData(values, photo), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateSurvey = async (id: string, values: SurveyFormValues, photo?: File | null): Promise<Survey> => {
  const res = await api.patch(`/surveys/${id}`, toFormData(values, photo), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
