import { randomUUID } from "crypto";
import { supabase } from "../config/supabase";

const SURVEY_PHOTO_BUCKET = "survey-photos";

export interface SurveyPayload {
  sl_no: string | null;
  ward: number | null;
  rr_number: string | null;
  mescom_meter_serial_number: string | null;
  zen_meter_serial_number: string | null;
  latitude: string | null;
  longitude: string | null;
  pole_number: string | null;
  pole_type: string | null;
  led_make: string | null;
  number_of_lights: number | null;
  wattages: string[] | null;
  cb_condition: string | null;
  dedicated_street_light_line: string | null;
}

const uploadSurveyPhoto = async (file: Express.Multer.File) => {
  const ext = file.originalname.split(".").pop() || "jpg";
  const path = `${randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(SURVEY_PHOTO_BUCKET)
    .upload(path, file.buffer, { contentType: file.mimetype });

  if (error) {
    console.error("Failed to upload survey photo:", error);
    throw new Error("Failed to upload photo");
  }

  const { data } = supabase.storage.from(SURVEY_PHOTO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

export const createSurvey = async (
  surveyorId: string,
  payload: SurveyPayload,
  file?: Express.Multer.File
) => {
  const photo_url = file ? await uploadSurveyPhoto(file) : null;

  return await supabase
    .from("surveys")
    .insert([{ ...payload, surveyor_id: surveyorId, photo_url }])
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
  file?: Express.Multer.File
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

  const update: Record<string, unknown> = {
    ...payload,
    updated_at: new Date().toISOString(),
    // Tracks who touched it *last* — flips back and forth as admin and the
    // surveyor take turns editing, rather than sticking once admin edits once.
    last_edited_by_role: requester.role,
    last_edited_at: new Date().toISOString(),
    last_edited_by_id: requester.id,
  };

  if (file) {
    update.photo_url = await uploadSurveyPhoto(file);
  }

  return await supabase
    .from("surveys")
    .update(update)
    .eq("id", id)
    .select("*, surveyor:users!surveyor_id(id, full_name)")
    .single();
};
