import { z } from "zod";

export const FAULT_CATEGORIES = [
  "Wire Change", "Light Replacement", "Switch Problem", "Jump Repair",
  "Rust Removal", "Pole Damage", "Cable Fault", "Other",
] as const;

export const COMPLAINT_SOURCES = [
  "Phone Calls", "Field Inspection", "Office Register", "Internal Survey",
] as const;

export const complaintSchema = z.object({
  citizen_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  contact_number: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  ward_number: z.coerce.number({ invalid_type_error: "Select a ward" }).int().min(1).max(60),
  area: z.string().trim().min(2, "Area is required").max(150),
  landmark: z.string().trim().min(2, "Landmark is required").max(150),
  fault_category: z.enum(FAULT_CATEGORIES, { errorMap: () => ({ message: "Select a fault category" }) }),
  description: z.string().trim().min(10, "Please describe the issue (min 10 characters)").max(1000),
  complaint_source: z.enum(COMPLAINT_SOURCES).optional(),
});

export type ComplaintFormValues = z.infer<typeof complaintSchema>;