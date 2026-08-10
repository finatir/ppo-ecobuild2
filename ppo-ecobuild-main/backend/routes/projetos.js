const express = require("express");
const db = require("../database");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/", auth, (req, res) => {
    const { nome_projeto, tijolo_id, area_parede, espessura_junta } = req.body;

    if (!nome_projeto || !Number.isInteger(Number(tijolo_id)) ||
        Number(area_parede) <= 0 || Number(espessura_junta) < 0) {
        return res.status(400).json({ erro: "Preencha os dados do projeto corretamente." });
    }

    db.run(
        `INSERT INTO projetos(usuario_id,tijolo_id,nome_projeto,area_parede,espessura_junta)
         VALUES(?,?,?,?,?)`,
        [req.session.usuario.id, Number(tijolo_id), nome_projeto.trim(), Number(area_parede), Number(espessura_junta)],
        function (err) {
            if (err) return res.status(500).json({ erro: err.message });
            res.status(201).json({ mensagem: "Projeto criado", id: this.lastID });
        }
    );
});

router.get("/", auth, (req, res) => {
    db.all(
        `SELECT projetos.*, tijolos.tipo, tijolos.comprimento, tijolos.largura, tijolos.altura
         FROM projetos INNER JOIN tijolos ON projetos.tijolo_id=tijolos.id
         WHERE projetos.usuario_id=? ORDER BY projetos.data_criacao DESC`,
        [req.session.usuario.id],
        (err, rows) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json(rows);
        }
    );
});

router.get("/:id", auth, (req, res) => {
    db.get(
        `SELECT projetos.*, tijolos.tipo, tijolos.comprimento, tijolos.largura, tijolos.altura
         FROM projetos INNER JOIN tijolos ON projetos.tijolo_id=tijolos.id
         WHERE projetos.id=? AND projetos.usuario_id=?`,
        [req.params.id, req.session.usuario.id],
        (err, row) => {
            if (err) return res.status(500).json({ erro: err.message });
            if (!row) return res.status(404).json({ erro: "Projeto não encontrado." });
            res.json(row);
        }
    );
});

router.put("/:id", auth, (req, res) => {
    const { nome_projeto, tijolo_id, area_parede, espessura_junta } = req.body;
    db.run(
        `UPDATE projetos SET nome_projeto=?, tijolo_id=?, area_parede=?, espessura_junta=?
         WHERE id=? AND usuario_id=?`,
        [nome_projeto, tijolo_id, area_parede, espessura_junta, req.params.id, req.session.usuario.id],
        function (err) {
            if (err) return res.status(500).json({ erro: err.message });
            if (!this.changes) return res.status(404).json({ erro: "Projeto não encontrado." });
            res.json({ mensagem: "Projeto atualizado" });
        }
    );
});

router.delete("/:id", auth, (req, res) => {
    db.run(`DELETE FROM calculos WHERE projeto_id=?`, [req.params.id], err => {
        if (err) return res.status(500).json({ erro: err.message });
        db.run(
            `DELETE FROM projetos WHERE id=? AND usuario_id=?`,
            [req.params.id, req.session.usuario.id],
            function (err) {
                if (err) return res.status(500).json({ erro: err.message });
                if (!this.changes) return res.status(404).json({ erro: "Projeto não encontrado." });
                res.json({ mensagem: "Projeto removido" });
            }
        );
    });
});

module.exports = router;
