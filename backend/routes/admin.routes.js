import express from "express";
import db from "./backend/db/db.js";

const router = express.Router();

router.post("/servicos", async (req, res) => {
  try {
    const { cat_service_id, nome, descricao, preco, duracao } = req.body;
    const [result] = await db.query(
      "INSERT INTO servicos (cat_service_id, nome, descricao, preco, duracao) VALUES (?, ?, ?, ?, ?)",
      [cat_service_id, nome, descricao, preco, duracao],
    );
    res.status(201).json({
      mensagem: "Serviço criado com sucesso!",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.get("/servicos", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM servicos");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.get("/servicos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM servicos WHERE service_id = ?",
      [id],
    );

    if (rows.length === 0)
      return res.status(404).json({ mensagem: "Serviço não encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.put("/servicos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { cat_service_id, nome, descricao, preco, duracao } = req.body;
    await db.query(
      "UPDATE servicos SET cat_service_id = ?, nome = ?, preco = ?, descricao = ?, duracao = ? WHERE service_id = ?",
      [cat_service_id, nome, preco, descricao, duracao, id],
    );
    res.json({ mensagem: "Serviço atualizado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.delete("/servicos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM servicos WHERE service_id = ?", [id]);
    res.json({ clientemensagem: "Serviço removido com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.get("/clientes", async (req, res) => {
  try {
    const { pesquisa } = req.query;
    let query =
      "SELECT util_id, nome, email, telefone, morada, cidade, ativo FROM utilizadores WHERE role = 'cliente'";
    let params = [];

    if (pesquisa) {
      query += " AND (nome LIKE ? OR email LIKE ?)";
      params = [`%${pesquisa}%`, `%${pesquisa}%`];
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.get("/clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      "SELECT util_id, nome, email, telefone, morada, cidade, ativo FROM utilizadores WHERE util_id = ? AND role = 'cliente'",
      [id],
    );

    if (rows.length === 0)
      return res.status(404).json({ mensagem: "Cliente não encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.get("/animais", async (req, res) => {
  try {
    const { pesquisa } = req.query;
    let query = `
            SELECT animais.*, utilizadores.nome AS nome_proprietario 
            FROM animais 
            INNER JOIN utilizadores ON animais.util_id = utilizadores.util_id
        `;
    let params = [];

    if (pesquisa) {
      query += " WHERE animais.nome LIKE ?";
      params = [`%${pesquisa}%`];
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.get("/marcacoes", async (req, res) => {
  try {
    const { estado, data } = req.query;
    let query = `
            SELECT m.*, a.nome AS nome_animal, s.nome AS nome_servico, u.nome AS nome_cliente, e.nome AS nome_estado
            FROM marcacoes m
            INNER JOIN animais a ON m.animal_id = a.animal_id
            INNER JOIN servicos s ON m.service_id = s.service_id
            INNER JOIN utilizadores u ON m.util_id = u.util_id
            INNER JOIN estados_marcacao e ON m.estado_id = e.estado_marc_id
            WHERE 1=1
        `;
    let params = [];

    if (estado) {
      query += " AND e.nome = ?";
      params.push(estado);
    }
    if (data) {
      query += " AND DATE(m.data_inicio) = ?";
      params.push(data);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.get("/marcacoes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM marcacoes WHERE marc_id = ?", [
      id,
    ]);

    if (rows.length === 0)
      return res.status(404).json({ mensagem: "Marcação não encontrada" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.patch("/marcacoes/:id/estado", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_id } = req.body;

    await db.query("UPDATE marcacoes SET estado_id = ? WHERE marc_id = ?", [
      estado_id,
      id,
    ]);
    res.json({ mensagem: `Estado da marcação ${id} atualizado com sucesso!` });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.get("/dashboard", async (req, res) => {
  try {
    const [[p_pendentes], [p_clientes], [p_animais]] = await Promise.all([
      db.query(
        "SELECT COUNT(*) AS total FROM marcacoes m INNER JOIN estados_marcacao e ON m.estado_id = e.estado_marc_id WHERE e.nome LIKE '%pendente%'",
      ),
      db.query(
        "SELECT COUNT(*) AS total FROM utilizadores WHERE role = 'cliente'",
      ),
      db.query("SELECT COUNT(*) AS total FROM animais"),
    ]);

    res.json({
      contagens: {
        marcacoesPendentes: p_pendentes[0].total,
        clientes: p_clientes[0].total,
        animais: p_animais[0].total,
      },
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

export default router;