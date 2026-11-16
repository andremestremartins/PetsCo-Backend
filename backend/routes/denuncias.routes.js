import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const [denuncia] = await db.query(
            "SELECT * FROM denuncias"
        );

        res.json({ denuncia });

    } catch (error) {
        res.status(500).json({
            mensagem: "Erro ao fazer a denuncia.",
            erro: error.message
        });
    }
});


router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [denuncia] = await db.query(
            "SELECT * FROM denuncias WHERE denuncia_id = ?",
            [id]
        );

        if (denuncia.length === 0) {
            return res.status(404).json({
                mensagem: "denuncia não encontrado."
            });
        }

        res.json({
            denuncia: denuncia[0]
        });

    } catch (error) {
        res.status(500).json({
            denuncia: "Erro ao fazer a denuncia.",
            erro: error.message
        });
    }
});


router.post("/", async (req, res) => {
    try {
        const {
            util_id,
            marc_id,
            categoria_id,
            assunto,
            descricao,
            estado_id
        } = req.body;

        const [resultado] = await db.query(
            `INSERT INTO denuncias
           (util_id, marc_id, categoria_id, assunto, descricao, estado_id)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                util_id,
                marc_id,
                categoria_id,
                assunto,
                descricao,
                estado_id
                
            ]
    );

        res.status(201).json({
            mensagem: "Denuncia enviada!",
            denuncia_id: resultado.insertId
        });

    } catch (error) {
        res.status(500).json({
            mensagem: "Erro ao enviar a denuncia.",
            erro: error.message
        });
    }
});


router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            util_id,
            marc_id,
            categoria_id,
            estado_id,
            assunto,
            descricao
        } = req.body;

        const [denuncia] = await db.query(
            `UPDATE denuncias SET
            util_id = ?,
            marc_id  = ?,
            categoria_id  = ?,
            estado_id  = ?,
            assunto  = ?,
            descricao  = ?
            WHERE denuncia_id = ?`,
            [
                util_id,
                marc_id,
                categoria_id,
                estado_id,
                assunto,
                descricao,
                id
            ]
        );

        if (denuncia.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "denuncia não encontrado."
            });
            
        }
        res.json({
               mensagem: `Denúncia com ID ${id} atualizada com sucesso!`
               
        });
    } catch (error) {
        res.status(500).json({
            mensagem: "Erro ao atualizar a denuncia.",
            erro: error.message
        });
    }
});


router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query(
            "DELETE FROM denuncias WHERE denuncia_id = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Denúncia não encontrada."
            });
        }

        res.json({
            mensagem: `Denúncia com o ID ${id} apagada com sucesso!`
        });

    } catch (error) {
        res.status(500).json({
            mensagem: "Erro ao apagar denúncia.",
            erro: error.message
        });
    }
});