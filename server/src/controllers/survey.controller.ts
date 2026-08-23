import { Request, Response } from "express";
import {
  createSurvey,
  getMySurveys,
  getAllSurveys,
  getSurveyById,
  updateSurvey,
} from "../services/survey.service";
import type { SurveyPayload } from "../services/survey.service";

const WARD_MIN = 1;
const WARD_MAX = 60;

const POLE_TYPES = ["RCC", "Octogonal", "Tubular", "Rail", "Mini Mast", "High Mast"];
// LED Make and per-light Wattage both have an "Others" option in the dropdown that
// lets the surveyor type a custom value instead — the client already resolves that
// to free text before sending, so these two fields accept any trimmed string here.
const CB_CONDITIONS = ["Good", "Bad"];
const YES_NO = ["yes", "no"];
const LIGHTS_MIN = 1;
const LIGHTS_MAX = 20;

// Every field in the survey form is optional — this only validates the shape
// of whatever *is* provided, it never requires a field to be present.
const buildPayload = (body: Record<string, unknown>): SurveyPayload => {
  const clean = (v: unknown): string | null =>
    v === undefined || v === null || String(v).trim() === "" ? null : String(v).trim();

  const ward = clean(body.ward);
  const pole_type = clean(body.pole_type);
  const led_make = clean(body.led_make);
  const numberOfLightsRaw = clean(body.number_of_lights);
  const cb_condition = clean(body.cb_condition);
  const dedicated_street_light_line = clean(body.dedicated_street_light_line);

  if (ward !== null) {
    const n = Number(ward);
    if (!Number.isInteger(n) || n < WARD_MIN || n > WARD_MAX) {
      throw new Error("Ward must be between 1 and 60");
    }
  }
  if (pole_type !== null && !POLE_TYPES.includes(pole_type)) throw new Error("Invalid pole type");
  if (cb_condition !== null && !CB_CONDITIONS.includes(cb_condition)) throw new Error("Invalid C & B condition");
  if (dedicated_street_light_line !== null && !YES_NO.includes(dedicated_street_light_line)) {
    throw new Error("Invalid value for dedicated street light line");
  }

  let number_of_lights: number | null = null;
  if (numberOfLightsRaw !== null) {
    const n = Number(numberOfLightsRaw);
    if (!Number.isInteger(n) || n < LIGHTS_MIN || n > LIGHTS_MAX) {
      throw new Error("Number of Lights must be between 1 and 20");
    }
    number_of_lights = n;
  }

  // The client sends the per-light wattage list as a JSON string (FormData
  // can't carry arrays natively). Fall back gracefully on anything malformed.
  let wattages: string[] | null = null;
  if (typeof body.wattages === "string" && body.wattages.trim() !== "") {
    let parsed: unknown;
    try {
      parsed = JSON.parse(body.wattages);
    } catch {
      throw new Error("Invalid wattages payload");
    }
    if (!Array.isArray(parsed)) throw new Error("Invalid wattages payload");

    const cleaned = parsed.map((w) => (w === null || w === undefined ? "" : String(w).trim()));
    wattages = number_of_lights !== null ? cleaned.slice(0, number_of_lights) : cleaned;
  }

  return {
    sl_no: clean(body.sl_no),
    ward: ward !== null ? Number(ward) : null,
    rr_number: clean(body.rr_number),
    mescom_meter_serial_number: clean(body.mescom_meter_serial_number),
    zen_meter_serial_number: clean(body.zen_meter_serial_number),
    latitude: clean(body.latitude),
    longitude: clean(body.longitude),
    pole_number: clean(body.pole_number),
    pole_type,
    led_make,
    number_of_lights,
    wattages,
    cb_condition,
    dedicated_street_light_line,
  };
};

export const addSurvey = async (req: Request, res: Response) => {
  try {
    const payload = buildPayload(req.body);
    const { data, error } = await createSurvey(req.user!.id, payload, req.file);
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

export const editSurvey = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  try {
    const payload = buildPayload(req.body);
    const { data, error } = await updateSurvey(
      id,
      { id: req.user!.id, role: req.user!.role as "ADMIN" | "SURVEYOR" },
      payload,
      req.file
    );
    if (error || !data) {
      return res.status(400).json({ message: (error as any)?.message ?? "Failed to update survey" });
    }
    return res.json(data);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};
