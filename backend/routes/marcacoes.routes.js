import express from "express";
import db from "../db/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const [marcacoes] = await db.query(
            "SELECT * FROM marcacoes"
        );

        res.json({ marcacoes });

    } catch (error) {
        res.status(500).json({
            mensagem: "Erro ao procurar marcações.",
            erro: error.message
        });
    }
});


router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [marcacoes] = await db.query(
            "SELECT * FROM marcacoes WHERE marc_id = ?",
            [id]
        );

        if (marcacoes.length === 0) {
            return res.status(404).json({
                mensagem: "Marcação não encontrada."
            });
        }

        res.json({
            marcacao: marcacoes[0]
        });

    } catch (error) {
        res.status(500).json({
            mensagem: "Erro ao procurar marcação.",
            erro: error.message
        });
    }
});


router.post("/", async (req, res) => {
    try {
        const {
            util_id,
            marc_id,
            service_id,
            estado_id,
            data_inicio,
            data_fim,
            observacoes,
            data_criacao,
            data_atualizacao,
            animal_id
        } = req.body;

        const [resultado] = await db.query(
            `INSERT INTO marcacoes
            (util_id, marc_id, service_id, estado_id, data_inicio,
            data_fim, observacoes, data_criacao, data_atualizacao, animal_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                util_id,
                marc_id,
                service_id,
                estado_id,
                data_inicio,
                data_fim,
                observacoes,
                data_criacao,
                data_atualizacao,
                animal_id
            ]
        );

        res.status(201).json({
            mensagem: "Marcação criada com sucesso!",
            marcacao_id: resultado.insertId
        });

    } catch (error) {
        res.status(500).json({
            mensagem: "Erro ao criar marcação.",
            erro: error.message
        });
    }
});

router.patch("/:id/cancelar", async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query(
            "UPDATE marcacoes SET estado_id = 3 WHERE marc_id = ?",
            [id]
        );  

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Marcação não encontrada."
            });
        }
        
        res.json({
            mensagem: "Marcação cancelada com sucesso!"
        });

    } catch (error) {
        res.status(500).json({
            mensagem: "Erro ao cancelar marcação.", 
            erro: error.message
        });
    }
});

export default router;
