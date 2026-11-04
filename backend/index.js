import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import animaisRoutes from "./routes/animais.routes.js";
import marcacoesRoutes from "./routes/marcacoes.routes.js";
import db from "./db/db.js"; 
// # Servidor
// PORT=3000
// NODE_ENV=development

// # Banco de Dados MySQL
// DB_HOST=localhost
// DB_USER=root
// DB_PASSWORD=123
// DB_NAME=petsco
// DB_CONNECTION_LIMIT=10

// # JWT (Authentication)
// JWT_SECRET=seu_segredo_muito_forte_e_aleatorio_aqui_minimo_32_caracteres_123456
// JWT_EXPIRES_IN=5h

// # CORS
// FRONTEND_URL=
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ name: "Petsco" });
});

app.use("/api/animais", animaisRoutes);
app.use("/api/marcacoes", marcacoesRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});