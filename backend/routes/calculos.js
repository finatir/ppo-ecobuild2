const express = require("express");
const db = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

function buscarProjetoDoUsuario(projetoId, usuarioId, callback) {
    db.get(
        `
        SELECT
            projetos.id,
            projetos.usuario_id,
            projetos.area_parede,
            projetos.espessura_junta,
            tijolos.tipo,
            tijolos.comprimento,
            tijolos.largura,
            tijolos.altura
        FROM projetos
        INNER JOIN tijolos ON projetos.tijolo_id = tijolos.id
        WHERE projetos.id = ? AND projetos.usuario_id = ?
        `,
        [projetoId, usuarioId],
        callback
    );
}

// REALIZAR CÁLCULO
router.post("/", auth, (req, res) => {
    const projetoId = Number(req.body.projeto_id);
    const modeloId = req.body.modelo_id ? Number(req.body.modelo_id) : null;

    if (!Number.isInteger(projetoId) || projetoId <= 0) {
        return res.status(400).json({ erro: "Projeto inválido." });
    }

    buscarProjetoDoUsuario(projetoId, req.session.usuario.id, (err, projeto) => {
        if (err) {
            return res.status(500).json({ erro: "Erro ao buscar o projeto." });
        }

        if (!projeto) {
            return res.status(404).json({ erro: "Projeto não encontrado." });
        }

        const area = Number(projeto.area_parede);
        const comprimento = Number(projeto.comprimento) / 100;
        const altura = Number(projeto.altura) / 100;
        const largura = Number(projeto.largura) / 100;
        const junta = Number(projeto.espessura_junta) / 100;

        if (area <= 0 || comprimento <= 0 || altura <= 0 || largura <= 0) {
            return res.status(400).json({ erro: "Os dados do projeto são inválidos para o cálculo." });
        }

        const areaModulo = (comprimento + junta) * (altura + junta);
        const qtdTijolos = Math.ceil(area / areaModulo);
        const qtdTeorica = area / areaModulo;
        const volumeParede = area * largura;
        const volumeTijolos = qtdTeorica * comprimento * altura * largura;
        const volumeArgamassa = Math.max(
            0,
            Number((volumeParede - volumeTijolos).toFixed(3))
        );

        db.run(
            `
            INSERT INTO calculos (
                projeto_id,
                modelo_id,
                qtd_tijolos,
                volume_argamassa,
                area_total
            ) VALUES (?, ?, ?, ?, ?)
            `,
            [projetoId, modeloId, qtdTijolos, volumeArgamassa, area],
            function (insertErr) {
                if (insertErr) {
                    return res.status(500).json({ erro: "Erro ao salvar cálculo." });
                }

                res.status(201).json({
                    id: this.lastID,
                    qtd_tijolos: qtdTijolos,
                    volume_argamassa: volumeArgamassa,
                    area_total: area
                });
            }
        );
    });
});

// HISTÓRICO GERAL DO USUÁRIO
router.get("/", auth, (req, res) => {
    db.all(
        `
        SELECT
            calculos.*,
            projetos.nome_projeto
        FROM calculos
        INNER JOIN projetos ON calculos.projeto_id = projetos.id
        WHERE projetos.usuario_id = ?
        ORDER BY calculos.data_calculo DESC
        `,
        [req.session.usuario.id],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ erro: "Erro ao carregar histórico." });
            }

            res.json(rows);
        }
    );
});

// HISTÓRICO DE UM PROJETO ESPECÍFICO
router.get("/historico/:projetoId", auth, (req, res) => {
    const projetoId = Number(req.params.projetoId);

    if (!Number.isInteger(projetoId) || projetoId <= 0) {
        return res.status(400).json({ erro: "Projeto inválido." });
    }

    buscarProjetoDoUsuario(projetoId, req.session.usuario.id, (err, projeto) => {
        if (err) {
            return res.status(500).json({ erro: "Erro ao validar o projeto." });
        }

        if (!projeto) {
            return res.status(404).json({ erro: "Projeto não encontrado." });
        }

        db.all(
            `
            SELECT *
            FROM calculos
            WHERE projeto_id = ?
            ORDER BY data_calculo DESC
            `,
            [projetoId],
            (historyErr, rows) => {
                if (historyErr) {
                    return res.status(500).json({ erro: "Erro ao buscar histórico." });
                }

                res.json(rows);
            }
        );
    });
});

module.exports = router;
