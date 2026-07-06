import { Request, Response } from "express";
import { getDashboardStats } from "../services/dashboard.service";

export const dashboard = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getDashboardStats();

    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: "Dashboard error",
    });
  }
};