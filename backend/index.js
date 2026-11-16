import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import animaisRoutes from "./routes/animais.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import servicosRoutes from "./routes/servicos.routes.js";
import denuciasRoutes from "./routes/denuncias.routes.js";
import marcacoesRoutes from "./routes/marcacoes.routes.js";



import db from "./config/db.js"; 

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ name: "Petsco" });
});

app.use("/api/animais", animaisRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/servicos", servicosRoutes);
app.use("/api/denucias", denuciasRoutes);
app.use("/api/marcacoes", marcacoesRoutes);
app.use("/api/avaliacoes", avaliacoesRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});