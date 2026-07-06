import { Request, Response } from "express";
import {
  getComplaints,
  createComplaint,
} from "../services/complaint.service";

export const fetchComplaints = async (
  req: Request,
  res: Response
) => {
  const { data, error } = await getComplaints();

  if (error) {
    return res.status(500).json(error);
  }

  return res.json(data);
};

export const addComplaint = async (
  req: Request,
  res: Response
) => {
  const complaint = req.body;

  const { data, error } =
    await createComplaint(complaint);

  if (error) {
    return res.status(500).json(error);
  }

  return res.status(201).json(data);
};