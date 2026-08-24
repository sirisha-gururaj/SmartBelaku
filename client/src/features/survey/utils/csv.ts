import type { Survey } from "../services/survey.service";

// Wraps a field in quotes (doubling any internal quotes) whenever it contains
// a character that would otherwise break the CSV structure.
const escapeCsvField = (value: string): string =>
  /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

const HEADERS = [
  "SL No", "Ward", "RR Number", "Mescom Meter Serial Number", "Zen Meter Serial Number", "Meter Photo URL",
  "Pole #", "Pole Number", "Pole Type", "Latitude", "Longitude", "Number of Lights",
  "Lights (LED Make / Wattage)", "C & B Condition", "Dedicated Street Light Line", "Photo URL",
  "Surveyor", "Submitted At", "Last Edited By", "Last Edited At",
];

// One CSV row per pole — the survey-level fields (SL No, Ward, ...) repeat on
// every row for that survey, same convention as exporting order line items.
const toRows = (s: Survey): string[][] => {
  const surveyFields = [
    s.sl_no ?? "",
    s.ward ? String(s.ward) : "",
    s.rr_number ?? "",
    s.mescom_meter_serial_number ?? "",
    s.zen_meter_serial_number ?? "",
    s.meter_photo_url ?? "",
  ];
  const surveyor = s.surveyor?.full_name ?? "";
  const submittedAt = s.created_at ? new Date(s.created_at).toLocaleString() : "";
  const lastEditedBy = s.last_edited_by_role === "ADMIN" ? "Admin" : s.last_edited_by_role === "SURVEYOR" ? "Surveyor" : "";
  const lastEditedAt = s.last_edited_at ? new Date(s.last_edited_at).toLocaleString() : "";

  if (s.poles.length === 0) {
    return [[...surveyFields, "", "", "", "", "", "", "", "", "", "", surveyor, submittedAt, lastEditedBy, lastEditedAt]];
  }

  return s.poles.map((p, i) => [
    ...surveyFields,
    String(i + 1),
    p.pole_number ?? "",
    p.pole_type ?? "",
    p.latitude ?? "",
    p.longitude ?? "",
    p.number_of_lights ? String(p.number_of_lights) : "",
    (p.lights ?? []).map((l, li) => `Light ${li + 1}: ${l.led_make || "—"} / ${l.wattage || "—"}`).join("; "),
    p.cb_condition ?? "",
    p.dedicated_street_light_line ?? "",
    p.photo_url ?? "",
    surveyor,
    submittedAt,
    lastEditedBy,
    lastEditedAt,
  ]);
};

export const exportSurveysToCsv = (surveys: Survey[], filename: string) => {
  const rows = [HEADERS, ...surveys.flatMap(toRows)];
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
