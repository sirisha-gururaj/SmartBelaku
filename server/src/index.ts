import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./config/supabase";
import dashboardRoutes from "./routes/dashboard.routes";
import complaintRoutes from "./routes/complaint.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/complaints", complaintRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", async (_, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("*");

  if (error) {
    return res.status(500).json(error);
  }

  return res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});