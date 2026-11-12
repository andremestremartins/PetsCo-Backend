import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const [denuncia] = await db.query(
            "SELECT * FROM denuncia"
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
            "SELECT * FROM animais WHERE animal_id = ?",
            [id]
        );

        if (denuncia.length === 0) {
            return res.status(404).json({
                mensagem: "denuncia não encontrado."
            });
        }

        res.json({
            denuncia: denuncias[0]
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
            denuncia_id,
            util_id,
            marc_id,
            categoria,
            assunto,
            descricao,
            estado ,
            data_criacao
        } = req.body;

        const [resultado] = await db.query(
            `INSERT INTO denuncia
            (denuncia_id, util_id, marc_id, categoria, assunto,
            descricao, estado, data_criacao)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                denuncia_id,
                util_id, 
                marc_id,
                categoria,
                assunto,
                descricao,
                estado,
                data_criacao
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
            nome,
            fotografia,
            especie,
            raca,
            data_nascimento,
            sexo,
            peso,
            informacoes
        } = req.body;

        const [denuncia] = await db.query(
            `UPDATE animais SET
            util_id = ?,
            nome = ?,
            fotografia = ?,
            especie = ?,
            raca = ?,
            data_nascimento = ?,
            sexo = ?,
            peso = ?,
            informacoes = ?
            WHERE animal_id = ?`,
            [
                util_id,
                nome,
                fotografia,
                especie,
                raca,
                data_nascimento,
                sexo,
                peso,
                informacoes,
                id
            ]
        );

        if (denuncia.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "denuncia não encontrado."
            });
        }

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
            "DELETE FROM animais WHERE animal_id = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Animal não encontrado."
            });
        }

        res.json({
            mensagem: `Animal com o ID ${id} apagado com sucesso!`
        });

    } catch (error) {
        res.status(500).json({
            mensagem: "Erro ao apagar animal.",
            erro: error.message
        });
    }
});

export default router;