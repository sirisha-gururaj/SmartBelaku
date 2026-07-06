import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (_, res) => {
    res.send("SmartBelaku API Running 🚀");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});