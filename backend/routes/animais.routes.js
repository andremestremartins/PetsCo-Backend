
import express from "express";
import db from "../db/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const [animais] = await db.query(
            "SELECT * FROM animais"
        );

        res.json({ animais });

    } catch (error) {
        res.status(500).json({
            mensagem: "Erro ao procurar animais.",
            erro: error.message
        });
    }
});


router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [animais] = await db.query(
            "SELECT * FROM animais WHERE animal_id = ?",
            [id]
        );

        if (animais.length === 0) {
            return res.status(404).json({
                mensagem: "Animal não encontrado."
            });
        }

        res.json({
            animal: animais[0]
        });

    } catch (error) {
        res.status(500).json({
            mensagem: "Erro ao procurar animal.",
            erro: error.message
        });
    }
});


router.post("/", async (req, res) => {
    try {
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

        const [resultado] = await db.query(
            `INSERT INTO animais
            (util_id, nome, fotografia, especie, raca,
            data_nascimento, sexo, peso, informacoes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                util_id,
                nome,
                fotografia,
                especie,
                raca,
                data_nascimento,
                sexo,
                peso,
                informacoes
            ]
        );

        res.status(201).json({
            mensagem: "Animal criado com sucesso!",
            animal_id: resultado.insertId
        });

    } catch (error) {
        res.status(500).json({
            mensagem: "Erro ao criar animal.",
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

        const [resultado] = await db.query(
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

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Animal não encontrado."
            });
        }

        res.json({
            mensagem: `Animal com o ID ${id} atualizado com sucesso!`
        });

    } catch (error) {
        res.status(500).json({
            mensagem: "Erro ao atualizar animal.",
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
