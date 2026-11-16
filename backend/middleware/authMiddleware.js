
import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Token não fornecido.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Token inválido ou expirado.",
    });
  }
}

export function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      sucesso: false,
      mensagem: "Acesso proibido. Apenas administradores.",
    });
  }

  next();
}
