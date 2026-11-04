
import express from "express";
import db from "../db/db.js";

const router = express.Router();


router.post("/registo", async (req, res) => {
    try {
        const {

        } = req.body;

    } catch (error) {
        res.status(500).json({
            mensagem: "Erro ao cria conta.",
            erro: error.message
        });
    }
});
router.post("/login", async (req, res) => {
    try {
        const {

        } = req.body;

    } catch (error) {
        res.status(500).json({
            mensagem: "Erro ao fazer login.",
            erro: error.message
        });
    }
});



export default router;
