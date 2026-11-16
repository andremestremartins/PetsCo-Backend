
import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import db from "../config/db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(CLIENT_ID);

// Gerar JWT
function gerarToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
}

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Email e password são obrigatórios.",
      });
    }

    const [users] = await db.query(
      "SELECT * FROM utilizadores WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Email ou password incorretos.",
      });
    }

    const user = users[0];

    const passwordValida = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordValida) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Email ou password incorretos.",
      });
    }

    const token = gerarToken(user);

    return res.status(200).json({
      sucesso: true,
      mensagem: "Login efetuado com sucesso.",
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
    });
  }
});


router.post("/registo", async (req, res) => {
  try {
    const { nome, email, telefone, password } = req.body;

    if (!nome || !email || !password) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Nome, email e password são obrigatórios.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "A password deve ter pelo menos 8 caracteres.",
      });
    }

    const [usersExistentes] = await db.query(
      "SELECT id FROM utilizadores WHERE email = ?",
      [email]
    );

    if (usersExistentes.length > 0) {
      return res.status(409).json({
        sucesso: false,
        mensagem: "Este email já está registado.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [resultado] = await db.query(
      `INSERT INTO utilizadores (nome, email, telefone, password, role)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, email, telefone || null, passwordHash, "cliente"]
    );

    const user = {
      id: resultado.insertId,
      nome,
      email,
      telefone: telefone || null,
      role: "cliente",
    };

    const token = gerarToken(user);

    return res.status(201).json({
      sucesso: true,
      mensagem: "Registo efetuado com sucesso.",
      token,
      user,
    });
  } catch (error) {
    console.error("Erro no registo:", error);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
    });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { token: googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Token do Google é obrigatório.",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Não foi possível obter o email do Google.",
      });
    }

    const email = payload.email;
    const nome = payload.name;

    const [users] = await db.query(
      "SELECT * FROM utilizadores WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Este email ainda não está registado na PetsCo.",
      });
    }

    const user = users[0];

    const tokenPetsco = gerarToken(user);

    return res.status(200).json({
      sucesso: true,
      mensagem: "Autenticação Google bem-sucedida.",
      token: tokenPetsco,
      user: {
        id: user.id,
        nome: user.nome || nome,
        email: user.email,
        telefone: user.telefone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erro na autenticação Google:", error);

    return res.status(401).json({
      sucesso: false,
      mensagem: "Token do Google inválido ou expirado.",
    });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, nome, email, telefone, role
       FROM utilizadores
       WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Utilizador não encontrado.",
      });
    }

    return res.status(200).json({
      sucesso: true,
      user: users[0],
    });
  } catch (error) {
    console.error("Erro ao obter perfil:", error);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
    });
  }
});

router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { nome, email, telefone } = req.body;

    if (!nome || !email) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Nome e email são obrigatórios.",
      });
    }

    const [usersExistentes] = await db.query(
      "SELECT id FROM utilizadores WHERE email = ? AND id != ?",
      [email, req.user.id]
    );

    if (usersExistentes.length > 0) {
      return res.status(409).json({
        sucesso: false,
        mensagem: "Este email já está associado a outra conta.",
      });
    }

    await db.query(
      `UPDATE utilizadores
       SET nome = ?, email = ?, telefone = ?
       WHERE id = ?`,
      [nome, email, telefone || null, req.user.id]
    );

    const [users] = await db.query(
      `SELECT id, nome, email, telefone, role
       FROM utilizadores
       WHERE id = ?`,
      [req.user.id]
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: "Perfil atualizado com sucesso.",
      user: users[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
    });
  }
});

router.put("/password", authMiddleware, async (req, res) => {
  try {
    const { passwordAtual, passwordNova } = req.body;

    if (!passwordAtual || !passwordNova) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "A password atual e a nova password são obrigatórias.",
      });
    }

    if (passwordNova.length < 8) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "A nova password deve ter pelo menos 8 caracteres.",
      });
    }

    const [users] = await db.query(
      "SELECT * FROM utilizadores WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Utilizador não encontrado.",
      });
    }

    const user = users[0];

    const passwordValida = await bcrypt.compare(
      passwordAtual,
      user.password
    );

    if (!passwordValida) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "A password atual está incorreta.",
      });
    }

    const passwordHash = await bcrypt.hash(passwordNova, 10);

    await db.query(
      "UPDATE utilizadores SET password = ? WHERE id = ?",
      [passwordHash, req.user.id]
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: "Password alterada com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao alterar password:", error);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
    });
  }
});

export default router;
