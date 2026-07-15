import { Request, Response } from "express";
import { createMslvlUser, listMslvlUsers  } from "../services/admin.service";

export const createMslvlAccount = async (req: Request, res: Response) => {
  try {
    const { full_name, email, phone, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "full_name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await createMslvlUser({ full_name, email, phone, password });
    return res.status(201).json({ user });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getMslvlAccounts = async (req: Request, res: Response) => {
  const { data, error } = await listMslvlUsers();
  if (error) {
    console.error("Failed to list MSLVL accounts:", error);
    return res.status(500).json({ message: "Failed to fetch MSLVL accounts" });
  }
  return res.json(data);
};