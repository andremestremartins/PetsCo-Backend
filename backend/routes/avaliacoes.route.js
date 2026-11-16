import express from "express";
import db from "../config/db.js";


const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const sql = `
      SELECT a.*, u.nome AS nome_utilizador 
      FROM avaliacoes a
      JOIN utilizadores u ON a.util_id = u.util_id
      ORDER BY a.data_criacao DESC
    `;
    const [avaliacoes] = await db.query(sql);
    res.status(200).json(avaliacoes);
  } catch (error) {
    console.error("Erro ao listar avaliações:", error);
    res.status(500).json({ erro: "Erro interno ao procurar avaliações." });
  }
});

router.get("/marcacao/:marc_id", async (req, res) => {
  const { marc_id } = req.params;

  try {
    const [avaliacao] = await db.query(
      "SELECT * FROM avaliacoes WHERE marc_id = ?",
      [marc_id]
    );

    if (avaliacao.length === 0) {
      return res
        .status(404)
        .json({ mensagem: "Nenhuma avaliação encontrada para esta marcação." });
    }

    res.status(200).json(avaliacao);
  } catch (error) {
    console.error("Erro ao obter avaliação:", error);
    res.status(500).json({ erro: "Erro interno do servidor." });
  }
});

router.post("/", async (req, res) => {
  const util_id = req.user ? req.user.util_id : req.body.util_id;
  const { marc_id, classificacao, comentario } = req.body;

  if (!util_id || !marc_id || !classificacao) {
    return res
      .status(400)
      .json({ erro: "Os campos util_id, marc_id e classificacao são obrigatórios." });
  }

  if (classificacao < 1 || classificacao > 5) {
    return res
      .status(400)
      .json({ erro: "A classificação deve ser entre 1 e 5." });
  }

  try {
        const [existente] = await db.query(
      "SELECT * FROM avaliacoes WHERE marc_id = ?",
      [marc_id]
    );
    if (existente.length > 0) {
      return res.status(400).json({ erro: "Esta marcação já foi avaliada." });
    }

    const sql = `
      INSERT INTO avaliacoes (util_id, marc_id, classificacao, comentario) 
      VALUES (?, ?, ?, ?)
    `;
    const [resultado] = await db.query(sql, [
      util_id,
      marc_id,
      classificacao,
      comentario || null,
    ]);

    res.status(201).json({
      mensagem: "Avaliação criada com sucesso!",
      avaliacao_id: resultado.insertId,
    });
  } catch (error) {
    console.error("Erro ao criar avaliação:", error);
    res.status(500).json({ erro: "Erro interno ao registar a avaliação." });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [resultado] = await db.query(
      "DELETE FROM avaliacoes WHERE avaliacao_id = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: "Avaliação não encontrada." });
    }

    res.status(200).json({ mensagem: "Avaliação eliminada com sucesso." });
  } catch (error) {
    console.error("Erro ao eliminar avaliação:", error);
    res.status(500).json({ erro: "Erro interno ao eliminar avaliação." });
  }
});

export default router;