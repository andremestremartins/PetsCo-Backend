import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const [notificacoes] = await db.query(
            "SELECT * FROM notificacoes"
        );

        res.json({ notificacoes });

    } catch (error) {
        res.status(500).json({
            mensagem: "Erro ao obter as notificações.",
            erro: error.message
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [notificacao] = await db.query(
            "SELECT * FROM notificacoes WHERE notificacao_id = ?",
            [id]
        );

        if (notificacao.length === 0) {
            return res.status(404).json({
                mensagem: "Notificação não encontrada."
            });
        }

        res.json({
            notificacao: notificacao[0]
        });

    } catch (error) {
        res.status(500).json({
            mensagem: "Erro ao obter a notificação.",
            erro: error.message
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const {
            util_id,
            titulo,
            mensagem,
            tipo,
            lida,
            data_criacao
        } = req.body;

        const [resultado] = await db.query(
            `INSERT INTO notificacoes
            (util_id, titulo, mensagem, tipo, lida, data_criacao)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                util_id,
                titulo,
                mensagem,
                tipo,
                lida,
                data_criacao
            ]
        );

        res.status(201).json({
            mensagem: "Notificação criada com sucesso!",
            notificacao_id: resultado.insertId
        });

    } catch (error) {
        res.status(500).json({
            mensagem: "Erro ao criar a notificação.",
            erro: error.message
        });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            util_id,
            titulo,
            mensagem,
            tipo,
            lida,
            data_criacao
        } = req.body;

        const [resultado] = await db.query(
            `UPDATE notificacoes SET
            util_id = ?,
            titulo = ?,
            mensagem = ?,
            tipo = ?,
            lida = ?,
            data_criacao = ?
            WHERE notificacao_id = ?`,
            [
                util_id,
                titulo,
                mensagem,
                tipo,
                lida,
                data_criacao,
                id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Notificação não encontrada."
            });
        }

        res.json({
            mensagem: `Notificação com ID ${id} atualizada com sucesso!`
        });

    } catch (error) {
        res.status(500).json({
            mensagem: "Erro ao atualizar a notificação.",
            erro: error.message
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query(
            "DELETE FROM notificacoes WHERE notificacao_id = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Notificação não encontrada."
            });
        }

        res.json({
            mensagem: `Notificação com ID ${id} apagada com sucesso!`
        });

    } catch (error) {
        res.status(500).json({
            mensagem: "Erro ao apagar a notificação.",
            erro: error.message
        });
    }
});

export default router;