import type { Survey } from "../services/survey.service";

// Wraps a field in quotes (doubling any internal quotes) whenever it contains
// a character that would otherwise break the CSV structure.
const escapeCsvField = (value: string): string =>
  /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

const HEADERS = [
  "SL No", "Ward", "RR Number", "Mescom Meter Serial Number", "Zen Meter Serial Number",
  "Photo URL", "Latitude", "Longitude", "Pole Number", "Pole Type", "LED Make",
  "Number of Lights", "Wattage per Light", "C & B Condition", "Dedicated Street Light Line",
  "Surveyor", "Submitted At", "Last Edited By", "Last Edited At",
];

const toRow = (s: Survey): string[] => [
  s.sl_no ?? "",
  s.ward ? String(s.ward) : "",
  s.rr_number ?? "",
  s.mescom_meter_serial_number ?? "",
  s.zen_meter_serial_number ?? "",
  s.photo_url ?? "",
  s.latitude ?? "",
  s.longitude ?? "",
  s.pole_number ?? "",
  s.pole_type ?? "",
  s.led_make ?? "",
  s.number_of_lights ? String(s.number_of_lights) : "",
  (s.wattages ?? []).map((w, i) => `Light ${i + 1}: ${w || "—"}`).join("; "),
  s.cb_condition ?? "",
  s.dedicated_street_light_line ?? "",
  s.surveyor?.full_name ?? "",
  s.created_at ? new Date(s.created_at).toLocaleString() : "",
  s.last_edited_by_role === "ADMIN" ? "Admin" : s.last_edited_by_role === "SURVEYOR" ? "Surveyor" : "",
  s.last_edited_at ? new Date(s.last_edited_at).toLocaleString() : "",
];

export const exportSurveysToCsv = (surveys: Survey[], filename: string) => {
  const rows = [HEADERS, ...surveys.map(toRow)];
  const csvContent = rows
    .map((row) => row.map((cell) => escapeCsvField(cell)).join(","))
    .join("\r\n");

  // Leading BOM so Excel auto-detects UTF-8 instead of garbling special characters.
  const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
