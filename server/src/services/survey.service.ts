import { randomUUID } from "crypto";
import { supabase } from "../config/supabase";

const SURVEY_PHOTO_BUCKET = "survey-photos";
const METER_PHOTO_BUCKET = "meter-photos";

export interface Light {
  led_make: string | null;
  wattage: string | null;
}

export interface Pole {
  photo_url: string | null;
  latitude: string | null;
  longitude: string | null;
  pole_number: string | null;
  pole_type: string | null;
  number_of_lights: number | null;
  lights: Light[];
  cb_condition: string | null;
  dedicated_street_light_line: string | null;
}

export interface SurveyPayload {
  ward: number | null;
  rr_number: string | null;
  mescom_meter_serial_number: string | null;
  zen_meter_serial_number: string | null;
  meter_photo_url: string | null;
  poles: Pole[];
}

const uploadPhoto = async (file: Express.Multer.File, bucket: string) => {
  const ext = file.originalname.split(".").pop() || "jpg";
  const path = `${randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file.buffer, { contentType: file.mimetype });

  if (error) {
    console.error(`Failed to upload photo to ${bucket}:`, error);
    throw new Error("Failed to upload photo");
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// Photos arrive as fields named photo_<poleIndex> — resolve each to a public
// URL and drop it onto the matching pole before it's ever written to the DB.
const applyPolePhotos = async (poles: Pole[], files: Express.Multer.File[]) => {
  for (const file of files) {
    const match = /^photo_(\d+)$/.exec(file.fieldname);
    if (!match) continue;
    const index = Number(match[1]);
    if (index < 0 || index >= poles.length) continue;
    poles[index].photo_url = await uploadPhoto(file, SURVEY_PHOTO_BUCKET);
  }
  return poles;
};

// The one form-level photo (next to the meter serial numbers) lives in its
// own bucket, separate from the per-pole photos.
const applyMeterPhoto = async (payload: Partial<SurveyPayload>, files: Express.Multer.File[]) => {
  const meterFile = files.find((f) => f.fieldname === "meter_photo");
  if (meterFile) {
    payload.meter_photo_url = await uploadPhoto(meterFile, METER_PHOTO_BUCKET);
  }
  return payload;
};

// Plain "1", "2", "3", ... — one per survey FORM, a simple running count per
// surveyor across all time (never resets). Pole numbering (P1, P2, ...) is
// handled entirely client-side, resetting fresh for every new form.
const getNextSlNo = async (surveyorId: string) => {
  const { count } = await supabase
    .from("surveys")
    .select("*", { count: "exact", head: true })
    .eq("surveyor_id", surveyorId);

  return String((count ?? 0) + 1);
};

export const createSurvey = async (
  surveyorId: string,
  payload: SurveyPayload,
  files: Express.Multer.File[]
) => {
  payload.poles = await applyPolePhotos(payload.poles, files);
  await applyMeterPhoto(payload, files);
  const sl_no = await getNextSlNo(surveyorId);

  return await supabase
    .from("surveys")
    .insert([{ ...payload, surveyor_id: surveyorId, sl_no }])
    .select("*")
    .single();
};

export const getMySurveys = async (surveyorId: string) => {
  return await supabase
    .from("surveys")
    .select("*")
    .eq("surveyor_id", surveyorId)
    .order("created_at", { ascending: false });
};

export const getAllSurveys = async () => {
  return await supabase
    .from("surveys")
    .select("*, surveyor:users!surveyor_id(id, full_name)")
    .order("created_at", { ascending: false });
};

export const getSurveyById = async (id: string) => {
  return await supabase
    .from("surveys")
    .select("*, surveyor:users!surveyor_id(id, full_name)")
    .eq("id", id)
    .single();
};

interface Requester {
  id: string;
  role: "ADMIN" | "SURVEYOR";
}

export const updateSurvey = async (
  id: string,
  requester: Requester,
  payload: Partial<SurveyPayload>,
  files: Express.Multer.File[]
) => {
  const { data: existing, error: fetchError } = await supabase
    .from("surveys")
    .select("id, surveyor_id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return { data: null, error: fetchError ?? { message: "Survey not found" } };
  }
  if (requester.role === "SURVEYOR" && existing.surveyor_id !== requester.id) {
    return { data: null, error: { message: "This survey does not belong to you" } };
  }

  if (payload.poles) {
    payload.poles = await applyPolePhotos(payload.poles, files);
  }
  await applyMeterPhoto(payload, files);

  const update: Record<string, unknown> = {
    ...payload,
    updated_at: new Date().toISOString(),
    // Tracks who touched it *last* — flips back and forth as admin and the
    // surveyor take turns editing, rather than sticking once admin edits once.
    last_edited_by_role: requester.role,
    last_edited_at: new Date().toISOString(),
    last_edited_by_id: requester.id,
  };

  return await supabase
    .from("surveys")
    .update(update)
    .eq("id", id)
    .select("*, surveyor:users!surveyor_id(id, full_name)")
    .single();
};
