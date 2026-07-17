import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";

dotenv.config();

const app = express();

const allowedOrigins: string[] = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

app.use("/api", routes);

const PORT = process.env.PORT || 5000;

app.get("/", (_, res) => {
  return res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});