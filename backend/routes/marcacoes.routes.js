import express from "express";
import db from "../db/db.js";

const router = express.Router();

// recebe um pedido e cria uma marcacao
router.post("/", async (req, res) => {
    const { animal_id, service_id, data_inicio, data_fim } = req.body ?? {};

    if (!animal_id || !service_id || !data_inicio || !data_fim) {
        return res.status(400).json({
            mensagem: "Preenche o animal, o serviço e as datas."
        });
    }

    if (
        !Number.isInteger(Number(animal_id)) || Number(animal_id) <= 0 ||
        !Number.isInteger(Number(service_id)) || Number(service_id) <= 0
    ) {
        return res.status(400).json({
            mensagem: "Os IDs do animal e do serviço devem ser números inteiros positivos."
        });
    }

    try {
        const [animais] = await db.execute(
            "SELECT animal_id FROM animais WHERE animal_id = ?",
            [Number(animal_id)]
        );

        if (animais.length === 0) {
            return res.status(404).json({
                mensagem: "Animal não encontrado."
            });
        }

        const [servicos] = await db.execute(
            "SELECT service_id, ativo FROM servicos WHERE service_id = ?",
            [Number(service_id)]
        );

        if (servicos.length === 0) {
            return res.status(404).json({
                mensagem: "Serviço não encontrado."
            });
        }

        if (Number(servicos[0].ativo) !== 1) {
            return res.status(400).json({
                mensagem: "Este serviço não está disponível."
            });
        }

        return res.json({
            mensagem: "Dados recebidos. Animal e serviço verificados.",
            dados: {
                animal_id,
                service_id,
                data_inicio,
                data_fim
            }
        });
    } catch (erro) {
        console.error("Erro ao consultar a base de dados:", erro);

        return res.status(500).json({
            mensagem: "Ocorreu um erro ao consultar a base de dados."
        });
    }
});

export default router;