import { Request, Response } from "express";
import { loginUser } from "../services/auth.service";

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    const data = await loginUser(
      email,
      password
    );

    return res.json(data);
  } catch (error: any) {
    return res.status(401).json({
      message: error.message,
    });
  }
};
