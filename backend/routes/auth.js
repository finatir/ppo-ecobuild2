const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../database");
const router = express.Router();

router.post("/cadastro", async (req, res) => {
    const nome = String(req.body.nome || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const senha = String(req.body.senha || "");

    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: "Preencha todos os campos." });
    }
    if (senha.length < 6) {
        return res.status(400).json({ erro: "A senha deve ter pelo menos 6 caracteres." });
    }

    try {
        const hash = await bcrypt.hash(senha, 10);
        db.run(
            `INSERT INTO usuarios (nome,email,senha) VALUES (?,?,?)`,
            [nome, email, hash],
            function (err) {
                if (err) {
                    if (err.message.includes("UNIQUE")) {
                        return res.status(409).json({ erro: "Este e-mail já está cadastrado." });
                    }
                    return res.status(500).json({ erro: "Erro ao criar conta." });
                }
                res.status(201).json({ mensagem: "Usuário criado com sucesso.", id: this.lastID });
            }
        );
    } catch {
        res.status(500).json({ erro: "Erro interno do servidor." });
    }
});

router.post("/login", (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const senha = String(req.body.senha || "");

    if (!email || !senha) {
        return res.status(400).json({ erro: "Informe e-mail e senha." });
    }

    db.get(`SELECT * FROM usuarios WHERE email=?`, [email], async (err, usuario) => {
        if (err) return res.status(500).json({ erro: "Erro ao consultar o banco." });
        if (!usuario) return res.status(401).json({ erro: "E-mail ou senha inválidos." });

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) return res.status(401).json({ erro: "E-mail ou senha inválidos." });

        req.session.usuario = { id: usuario.id, nome: usuario.nome, email: usuario.email };
        res.json({ mensagem: "Login realizado com sucesso.", usuario: req.session.usuario });
    });
});

router.get("/me", (req, res) => {
    if (!req.session.usuario) return res.status(401).json({ erro: "Não autenticado." });
    res.json(req.session.usuario);
});

router.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ erro: "Erro ao sair." });
        res.clearCookie("connect.sid");
        res.json({ mensagem: "Logout realizado." });
    });
});

module.exports = router;
