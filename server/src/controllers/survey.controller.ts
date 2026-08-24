import { Request, Response } from "express";
import {
  createSurvey,
  getMySurveys,
  getAllSurveys,
  getSurveyById,
  updateSurvey,
  softDeleteSurvey,
  hardDeleteSurvey,
} from "../services/survey.service";
import type { SurveyPayload, Pole, Light } from "../services/survey.service";

const WARD_MIN = 1;
const WARD_MAX = 60;
const LIGHTS_MIN = 1;
const LIGHTS_MAX = 20;

const POLE_TYPES = ["RCC", "Octogonal", "Tubular", "Rail", "Mini Mast", "High Mast"];
const CB_CONDITIONS = ["Good", "Bad"];
const YES_NO = ["yes", "no"];
const LIGHTS_LABELS = ["Required", "Not Required"];
// LED Make and Wattage both have an "Others" dropdown option that lets the
// surveyor type a custom value instead — the client already resolves that to
// free text before sending, so those two are accepted as any trimmed string.

const clean = (v: unknown): string | null =>
  v === undefined || v === null || String(v).trim() === "" ? null : String(v).trim();

const buildLight = (raw: any): Light => ({
  led_make: clean(raw?.led_make),
  wattage: clean(raw?.wattage),
});

const buildPole = (raw: any): Pole => {
  const pole_type = clean(raw?.pole_type);
  const cb_condition = clean(raw?.cb_condition);
  const dedicated_street_light_line = clean(raw?.dedicated_street_light_line);
  const numberOfLightsRaw = clean(raw?.number_of_lights);

  if (pole_type !== null && !POLE_TYPES.includes(pole_type)) throw new Error("Invalid pole type");
  if (cb_condition !== null && !CB_CONDITIONS.includes(cb_condition)) throw new Error("Invalid C & B condition");
  if (dedicated_street_light_line !== null && !YES_NO.includes(dedicated_street_light_line)) {
    throw new Error("Invalid value for dedicated street light line");
  }

  let number_of_lights: number | string | null = null;
  if (numberOfLightsRaw !== null) {
    if (LIGHTS_LABELS.includes(numberOfLightsRaw)) {
      number_of_lights = numberOfLightsRaw;
    } else {
      const n = Number(numberOfLightsRaw);
      if (!Number.isInteger(n) || n < LIGHTS_MIN || n > LIGHTS_MAX) {
        throw new Error("Number of Lights must be between 1 and 20, or Required / Not Required");
      }
      number_of_lights = n;
    }
  }

  // "Required"/"Not Required" aren't counts, so there's nothing to size the
  // lights list against — only an actual number produces light rows.
  const lightsRaw = Array.isArray(raw?.lights) ? raw.lights : [];
  const lights = typeof number_of_lights === "number" ? lightsRaw.slice(0, number_of_lights).map(buildLight) : [];

  return {
    photo_url: clean(raw?.photo_url),
    latitude: clean(raw?.latitude),
    longitude: clean(raw?.longitude),
    pole_number: clean(raw?.pole_number),
    pole_type,
    number_of_lights,
    lights,
    cb_condition,
    dedicated_street_light_line,
  };
};

// Every field in the survey form is optional — this only validates the shape
// of whatever *is* provided, it never requires a field to be present.
const buildPayload = (body: Record<string, unknown>): SurveyPayload => {
  const ward = clean(body.ward);
  if (ward !== null) {
    const n = Number(ward);
    if (!Number.isInteger(n) || n < WARD_MIN || n > WARD_MAX) {
      throw new Error("Ward must be between 1 and 60");
    }
  }

  let poles: Pole[] = [];
  if (typeof body.poles === "string" && body.poles.trim() !== "") {
    let parsed: unknown;
    try {
      parsed = JSON.parse(body.poles);
    } catch {
      throw new Error("Invalid poles payload");
    }
    if (!Array.isArray(parsed)) throw new Error("Invalid poles payload");
    poles = parsed.map(buildPole);
  }

  return {
    ward: ward !== null ? Number(ward) : null,
    rr_number: clean(body.rr_number),
    mescom_meter_serial_number: clean(body.mescom_meter_serial_number),
    zen_meter_serial_number: clean(body.zen_meter_serial_number),
    meter_photo_url: clean(body.meter_photo_url),
    poles,
  };
};

const getFiles = (req: Request): Express.Multer.File[] =>
  Array.isArray(req.files) ? (req.files as Express.Multer.File[]) : [];

export const addSurvey = async (req: Request, res: Response) => {
  try {
    const payload = buildPayload(req.body);
    const { data, error } = await createSurvey(req.user!.id, payload, getFiles(req));
    if (error) {
      console.error("Failed to create survey:", error);
      return res.status(500).json({ message: "Failed to save survey" });
    }
    return res.status(201).json(data);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const fetchMySurveys = async (req: Request, res: Response) => {
  const { data, error } = await getMySurveys(req.user!.id);
  if (error) {
    console.error("Failed to fetch surveys:", error);
    return res.status(500).json({ message: "Failed to fetch surveys" });
  }
  return res.json(data);
};

export const fetchAllSurveys = async (_req: Request, res: Response) => {
  const { data, error } = await getAllSurveys();
  if (error) {
    console.error("Failed to fetch surveys:", error);
    return res.status(500).json({ message: "Failed to fetch surveys" });
  }
  return res.json(data);
};

export const fetchSurveyById = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { data, error } = await getSurveyById(id);
  if (error || !data) {
    return res.status(404).json({ message: "Survey not found" });
  }

  if (req.user!.role === "SURVEYOR" && data.surveyor_id !== req.user!.id) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  return res.json(data);
};

// A surveyor deleting their own survey only hides it from their own list —
// Admin still sees it, tagged as deleted by the surveyor. Admin deleting a
// survey removes it outright.
export const removeSurvey = async (req: Request, res: Response) => {
  const id = String(req.params.id);

  if (req.user!.role === "ADMIN") {
    const { data, error } = await hardDeleteSurvey(id);
    if (error || !data) {
      return res.status(404).json({ message: "Survey not found" });
    }
    return res.json({ success: true });
  }

  const { data, error } = await softDeleteSurvey(id, req.user!.id);
  if (error || !data) {
    return res.status(404).json({ message: "Survey not found" });
  }
  return res.json({ success: true });
};

export const editSurvey = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  try {
    const payload = buildPayload(req.body);
    const { data, error } = await updateSurvey(
      id,
      { id: req.user!.id, role: req.user!.role as "ADMIN" | "SURVEYOR" },
      payload,
      getFiles(req)
    );
    if (error || !data) {
      return res.status(400).json({ message: (error as any)?.message ?? "Failed to update survey" });
    }
    return res.json(data);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};
