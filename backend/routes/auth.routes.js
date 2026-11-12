import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

const router = Router();

const CLIENT_ID = "://googleusercontent.com";
const googleClient = new OAuth2Client(CLIENT_ID);

router.post("/login", (req, res) => {});

router.post("/register", (req, res) => {});

router.post("/google", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token do Google é obrigatório." });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload["email"];
    const name = payload["name"];

    const jwtSecreto = process.env.JWT_SECRET || "SUA_CHAVE_SECRETA_PADRAO";

    const tokenPetsco = jwt.sign({ email: email, role: "user" }, jwtSecreto, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      message: "Autenticação Google bem-sucedida!",
      token: tokenPetsco,
      user: { name, email },
    });
  } catch (error) {
    console.error("Erro na autenticação do Google:", error);
    return res
      .status(401)
      .json({ error: "Token do Google inválido ou expirado." });
  }
});

export default router;


