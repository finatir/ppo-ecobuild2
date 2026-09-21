const express = require("express");
const { pool } = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

async function buscarProjetoDoUsuario(projetoId, usuarioId) {
    const result = await pool.query(
        `SELECT
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
         WHERE projetos.id = $1
           AND projetos.usuario_id = $2`,
        [projetoId, usuarioId]
    );

    return result.rows[0] || null;
}

// REALIZAR CÁLCULO
router.post("/", auth, async (req, res) => {
    const projetoId = Number(req.body.projeto_id);
    const modeloId =
        req.body.modelo_id !== undefined &&
        req.body.modelo_id !== null &&
        req.body.modelo_id !== ""
            ? Number(req.body.modelo_id)
            : null;

    if (!Number.isInteger(projetoId) || projetoId <= 0) {
        return res.status(400).json({
            erro: "Projeto inválido."
        });
    }

    if (modeloId !== null && (!Number.isInteger(modeloId) || modeloId <= 0)) {
        return res.status(400).json({
            erro: "Modelo inválido."
        });
    }

    try {
        const projeto = await buscarProjetoDoUsuario(
            projetoId,
            req.session.usuario.id
        );

        if (!projeto) {
            return res.status(404).json({
                erro: "Projeto não encontrado."
            });
        }

        if (modeloId !== null) {
            const modelo = await pool.query(
                `SELECT id FROM modelos_pre_definidos WHERE id = $1`,
                [modeloId]
            );

            if (!modelo.rowCount) {
                return res.status(400).json({
                    erro: "Modelo selecionado não existe."
                });
            }
        }

        const area = Number(projeto.area_parede);
        const comprimento = Number(projeto.comprimento) / 100;
        const altura = Number(projeto.altura) / 100;
        const largura = Number(projeto.largura) / 100;
        const junta = Number(projeto.espessura_junta) / 100;

        if (
            area <= 0 ||
            comprimento <= 0 ||
            altura <= 0 ||
            largura <= 0
        ) {
            return res.status(400).json({
                erro: "Os dados do projeto são inválidos para o cálculo."
            });
        }

        const areaModulo =
            (comprimento + junta) *
            (altura + junta);

        const qtdTijolos =
            Math.ceil(area / areaModulo);

        const qtdTeorica =
            area / areaModulo;

        const volumeParede =
            area * largura;

        const volumeTijolos =
            qtdTeorica *
            comprimento *
            altura *
            largura;

        const volumeArgamassa = Math.max(
            0,
            Number(
                (volumeParede - volumeTijolos).toFixed(3)
            )
        );

        const result = await pool.query(
            `INSERT INTO calculos (
                projeto_id,
                modelo_id,
                qtd_tijolos,
                volume_argamassa,
                area_total
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id`,
            [
                projetoId,
                modeloId,
                qtdTijolos,
                volumeArgamassa,
                area
            ]
        );

        return res.status(201).json({
            id: result.rows[0].id,
            qtd_tijolos: qtdTijolos,
            volume_argamassa: volumeArgamassa,
            area_total: area
        });
    } catch (err) {
        console.error("Erro ao realizar cálculo:", err);
        return res.status(500).json({
            erro: "Erro ao salvar cálculo."
        });
    }
});

// HISTÓRICO GERAL DO USUÁRIO
router.get("/", auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                calculos.*,
                projetos.nome_projeto
             FROM calculos
             INNER JOIN projetos ON calculos.projeto_id = projetos.id
             WHERE projetos.usuario_id = $1
             ORDER BY calculos.data_calculo DESC`,
            [req.session.usuario.id]
        );

        return res.json(result.rows);
    } catch (err) {
        console.error("Erro ao carregar histórico:", err);
        return res.status(500).json({
            erro: "Erro ao carregar histórico."
        });
    }
});

// HISTÓRICO DE UM PROJETO ESPECÍFICO
router.get("/historico/:projetoId", auth, async (req, res) => {
    const projetoId = Number(req.params.projetoId);

    if (!Number.isInteger(projetoId) || projetoId <= 0) {
        return res.status(400).json({
            erro: "Projeto inválido."
        });
    }

    try {
        const projeto = await buscarProjetoDoUsuario(
            projetoId,
            req.session.usuario.id
        );

        if (!projeto) {
            return res.status(404).json({
                erro: "Projeto não encontrado."
            });
        }

        const result = await pool.query(
            `SELECT *
             FROM calculos
             WHERE projeto_id = $1
             ORDER BY data_calculo DESC`,
            [projetoId]
        );

        return res.json(result.rows);
    } catch (err) {
        console.error("Erro ao buscar histórico do projeto:", err);
        return res.status(500).json({
            erro: "Erro ao buscar histórico."
        });
    }
});

module.exports = router;
