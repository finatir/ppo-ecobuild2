const express = require("express");
const bcrypt = require("bcryptjs");
const { pool } = require("../database");

const router = express.Router();

router.post("/cadastro", async (req, res) => {
    const nome = String(req.body.nome || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const senha = String(req.body.senha || "");

    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: "Preencha todos os campos." });
    }

    if (senha.length < 6) {
        return res.status(400).json({
            erro: "A senha deve ter pelo menos 6 caracteres."
        });
    }

    try {
        const hash = await bcrypt.hash(senha, 10);

        const result = await pool.query(
            `INSERT INTO usuarios (nome, email, senha)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [nome, email, hash]
        );

        return res.status(201).json({
            mensagem: "Usuário criado com sucesso.",
            id: result.rows[0].id
        });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({
                erro: "Este e-mail já está cadastrado."
            });
        }

        console.error("Erro no cadastro:", err);
        return res.status(500).json({
            erro: "Erro ao criar conta."
        });
    }
});

router.post("/login", async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const senha = String(req.body.senha || "");

    if (!email || !senha) {
        return res.status(400).json({
            erro: "Informe e-mail e senha."
        });
    }

    try {
        const result = await pool.query(
            `SELECT id, nome, email, senha
             FROM usuarios
             WHERE email = $1`,
            [email]
        );

        const usuario = result.rows[0];

        if (!usuario) {
            return res.status(401).json({
                erro: "E-mail ou senha inválidos."
            });
        }

        const senhaValida = await bcrypt.compare(
            senha,
            usuario.senha
        );

        if (!senhaValida) {
            return res.status(401).json({
                erro: "E-mail ou senha inválidos."
            });
        }

        req.session.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        };

        return res.json({
            mensagem: "Login realizado com sucesso.",
            usuario: req.session.usuario
        });
    } catch (err) {
        console.error("Erro no login:", err);
        return res.status(500).json({
            erro: "Erro ao consultar o banco."
        });
    }
});

router.get("/me", (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({
            erro: "Não autenticado."
        });
    }

    return res.json(req.session.usuario);
});

router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Erro no logout:", err);
            return res.status(500).json({
                erro: "Erro ao sair."
            });
        }

        res.clearCookie("connect.sid");

        return res.json({
            mensagem: "Logout realizado."
        });
    });
});

module.exports = router;
