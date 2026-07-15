import { Request, Response } from "express";
import { getComplaints, createComplaint, getComplaintByNumber,  assignComplaint, getAssignedComplaints  } from "../services/complaint.service";

const FAULT_CATEGORIES = [
  "Wire Change", "Light Replacement", "Switch Problem", "Jump Repair",
  "Rust Removal", "Pole Damage", "Cable Fault", "Other",
];

const COMPLAINT_SOURCES = [
  "Phone Calls", "Field Inspection", "Office Register", "Internal Survey",
];

export const fetchComplaints = async (req: Request, res: Response) => {
  const { data, error } = await getComplaints();
  if (error) {
    return res.status(500).json({ message: "Failed to fetch complaints" });
  }
  return res.json(data);
};

export const addComplaint = async (req: Request, res: Response) => {
  const {
    citizen_name,
    contact_number,
    ward_number,
    area,
    landmark,
    fault_category,
    description,
    complaint_source,
  } = req.body;

  if (!citizen_name || !contact_number || !ward_number || !area || !landmark || !fault_category) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!FAULT_CATEGORIES.includes(fault_category)) {
    return res.status(400).json({ message: "Invalid fault category" });
  }

  // Only a verified Admin token can set an internal source; everyone else is logged as the citizen portal
  const role = req.user?.role;
  let source = "Citizen Portal";

  if (role === "ADMIN" && complaint_source) {
    if (!COMPLAINT_SOURCES.includes(complaint_source)) {
        return res.status(400).json({ message: "Invalid complaint source" });
    }
    source = complaint_source;
  } else if (role === "MSLVL") {
    source = "Field Inspection";
 }

  const safePayload = {
    citizen_name: String(citizen_name).trim(),
    contact_number: String(contact_number).trim(),
    ward_number: Number(ward_number),
    area: String(area).trim(),
    landmark: String(landmark).trim(),
    fault_category,
    description: description ? String(description).trim() : null,
    complaint_source: source,
    status: "NEW", // always server-set — never trust the client
  };

  const { data, error } = await createComplaint(safePayload);

  if (error) {
    return res.status(500).json({ message: "Failed to register complaint" });
  }

  return res.status(201).json(data);
};

export const trackComplaint = async (req: Request, res: Response) => {
  const { complaint_number } = req.params;

  if (!complaint_number) {
    return res.status(400).json({ message: "Complaint number is required" });
  }

  const { data, error } = await getComplaintByNumber(complaint_number.trim().toUpperCase());

  if (error || !data) {
    return res.status(404).json({ message: "No complaint found with that number" });
  }

  return res.json(data);
};

export const assignComplaintToMslvl = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { mslvl_id } = req.body;

  if (!mslvl_id) {
    return res.status(400).json({ message: "mslvl_id is required" });
  }

  const { data, error } = await assignComplaint(id, mslvl_id);

  if (error || !data) {
    console.error("Failed to assign complaint:", error);
    return res.status(400).json({ message: (error as any)?.message ?? "Failed to assign complaint" });
  }

  return res.json(data);
};

export const fetchAssignedComplaints = async (req: Request, res: Response) => {
  const { data, error } = await getAssignedComplaints(req.user!.id);

  if (error) {
    console.error("Failed to fetch assigned complaints:", error);
    return res.status(500).json({ message: "Failed to fetch assigned complaints" });
  }

  return res.json(data);
};

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/complaint.service";
// (add these four to the existing import line)

export const fetchNotifications = async (req: Request, res: Response) => {
  const { data, error } = await getNotifications();
  if (error) {
    console.error("Failed to fetch notifications:", error);
    return res.status(500).json({ message: "Failed to fetch notifications" });
  }
  const unreadCount = await getUnreadNotificationCount();
  return res.json({ notifications: data, unreadCount });
};

export const readNotification = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await markNotificationRead(id);
  if (error) {
    console.error("Failed to mark notification read:", error);
    return res.status(500).json({ message: "Failed to update notification" });
  }
  return res.json(data);
};

export const readAllNotifications = async (req: Request, res: Response) => {
  const { error } = await markAllNotificationsRead();
  if (error) {
    console.error("Failed to mark all notifications read:", error);
    return res.status(500).json({ message: "Failed to update notifications" });
  }
  return res.json({ success: true });
};