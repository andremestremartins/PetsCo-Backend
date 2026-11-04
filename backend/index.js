import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import animaisRoutes from "./routes/animais.routes.js";
import db from "./db/db.js"; 

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ name: "Petsco" });
});

app.use("/api/animais", animaisRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});