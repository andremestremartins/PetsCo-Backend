import express from "express";
import db from "./backend/db/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const [servicos] = await db.query(`
            SELECT
                s.service_id,
                s.nome,
                s.descricao,
                s.preco,
                s.duracao,
                s.fotografia,
                s.ativo,
                c.nome AS categoria
            FROM servicos s
            INNER JOIN categorias_servico c
                ON s.cat_service_id = c.cat_service_id
        `);

        res.status(200).json(servicos);

    } catch (erro) {
        console.error("Erro ao listar serviços:", erro);
        res.status(500).json({ erro: "Erro ao obter serviços." });
    }
});





router.post("/", async (req, res) => {
    try {
        const {
            cat_service_id,
            nome,
            descricao,
            preco,
            duracao,
            fotografia
        } = req.body;

        if (!nome || typeof nome !== "string" || nome.trim() === "") {
            return res.status(400).json({ erro: "O nome do serviço é obrigatório." });
        }
        const nome_limpo = nome.trim();
        const id = Number(cat_service_id)
        if (!Number.isInteger(id) || id <= 0 ) {
            return res.status(400).json({ erro: "O ID precisa de ser um NÚMERO INTEIRO E MAIOR QUE 0"})
        }

        if (
            preco === undefined ||
            preco === null ||
            (typeof preco === "string" && preco.trim() === "")
        ) {
            return res.status(400).json({
                erro: "O preço é obrigatório."
            });
        }
        const preco_num = Number(preco);

        if (!Number.isFinite(preco_num) || preco_num <= 0) {
            return res.status(400).json({
                erro: "O preço precisa de ser um número válido maior que 0."
            });
        }


        if (!Number.isInteger(duracao) || duracao <= 0) {
            return res.status(400).json({
            erro: "A duração precisa de ser um número inteiro maior que 0 (minutos)."
        });
}

        const [categorias] = await db.query(
        "SELECT * FROM categorias_servico WHERE cat_service_id = ?",
        [id]
        );

        if (categorias.length === 0) {
            return res.status(400).json({
                erro: "A categoria não existe"
            })
        }
        
        const [resultado] = await db.query(
        "INSERT INTO servicos (cat_service_id, nome, descricao, preco, duracao, fotografia) VALUES (?, ?, ?, ?, ?, ?)",
        [id, nome_limpo, descricao, preco_num, duracao, fotografia]
        );

        res.status(201).json({
            mensagem: "Serviço criado com sucesso",
            service_id: resultado.insertId,
            nome: nome,
        })


    } catch (erro) {
        console.error("Erro ao criar serviço:", erro);
        res.status(500).json({ erro: "Erro ao criar serviço." });
    }
});





router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: "O ID precisa de ser um NÚMERO INTEIRO E MAIOR QUE 0" });
    }

    try {
        const [servico] = await db.query("SELECT * FROM servicos WHERE service_id = ?", [id]);
        if (servico.length === 0) {
            return res.status(404).json({ erro: "Serviço não encontrado" });
        }
        await db.query("DELETE FROM servicos WHERE service_id = ?", [id]);
        res.status(200).json({ mensagem: "Serviço deletado com sucesso" });

    } catch (erro) {
        console.error("Erro ao deletar serviço:", erro);
        res.status(500).json({ erro: "Erro ao deletar serviço." });
    }
});









router.put("/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            erro: "O ID precisa de ser um NÚMERO INTEIRO E MAIOR QUE 0"
        });
    }

    try {
        const {
            cat_service_id,
            nome,
            descricao,
            preco,
            duracao,
            fotografia
        } = req.body;

        if (!nome || typeof nome !== "string" || nome.trim() === "") {
            return res.status(400).json({
                erro: "O nome do serviço é obrigatório."
            });
        }
        const nome_limpo = nome.trim();

        const categoria_id = Number(cat_service_id);

        if (!Number.isInteger(categoria_id) || categoria_id <= 0) {
            return res.status(400).json({
                erro: "O ID da categoria precisa de ser um NÚMERO INTEIRO E MAIOR QUE 0"
            });
        }

        if (
            preco === undefined ||
            preco === null ||
            (typeof preco === "string" && preco.trim() === "")
        ) {
            return res.status(400).json({
                erro: "O preço é obrigatório."
            });
        }

        const preco_num = Number(preco);

        if (!Number.isFinite(preco_num) || preco_num <= 0) {
            return res.status(400).json({
                erro: "O preço precisa de ser um número válido maior que 0."
            });
        }


        if (!Number.isInteger(duracao) || duracao <= 0) {
            return res.status(400).json({
            erro: "A duração precisa de ser um número inteiro maior que 0 (minutos)."
        });
}

        const [servico] = await db.query(
            "SELECT * FROM servicos WHERE service_id = ?",
            [id]
        );

        if (servico.length === 0) {
            return res.status(404).json({
                erro: "Serviço não encontrado"
            });
        }

        const [categorias] = await db.query(
            "SELECT * FROM categorias_servico WHERE cat_service_id = ?",
            [categoria_id]
        );

        if (categorias.length === 0) {
            return res.status(400).json({
                erro: "A categoria não existe"
            });
        }

        await db.query(
            "UPDATE servicos SET cat_service_id = ?, nome = ?, descricao = ?, preco = ?, duracao = ?, fotografia = ? WHERE service_id = ?",
            [categoria_id, nome_limpo, descricao, preco_num, duracao, fotografia, id]
        );

        res.status(200).json({
            mensagem: "Serviço atualizado com sucesso",
            service_id: id,
            nome: nome
        });

    } catch (erro) {
        console.error("Erro ao atualizar serviço:", erro);

        res.status(500).json({
            erro: "Erro ao atualizar serviço."
        });
    }
});

export default router;