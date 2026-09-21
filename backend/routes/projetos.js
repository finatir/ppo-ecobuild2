const express = require("express");
const { pool } = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, async (req, res) => {
    const nomeProjeto = String(req.body.nome_projeto || "").trim();
    const tijoloId = Number(req.body.tijolo_id);
    const areaParede = Number(req.body.area_parede);
    const espessuraJunta = Number(req.body.espessura_junta);

    if (
        !nomeProjeto ||
        !Number.isInteger(tijoloId) ||
        tijoloId <= 0 ||
        !Number.isFinite(areaParede) ||
        areaParede <= 0 ||
        !Number.isFinite(espessuraJunta) ||
        espessuraJunta < 0
    ) {
        return res.status(400).json({
            erro: "Preencha os dados do projeto corretamente."
        });
    }

    try {
        const tijolo = await pool.query(
            `SELECT id FROM tijolos WHERE id = $1`,
            [tijoloId]
        );

        if (!tijolo.rowCount) {
            return res.status(400).json({
                erro: "Tijolo selecionado não existe."
            });
        }

        const result = await pool.query(
            `INSERT INTO projetos (
                usuario_id,
                tijolo_id,
                nome_projeto,
                area_parede,
                espessura_junta
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id`,
            [
                req.session.usuario.id,
                tijoloId,
                nomeProjeto,
                areaParede,
                espessuraJunta
            ]
        );

        return res.status(201).json({
            mensagem: "Projeto criado.",
            id: result.rows[0].id
        });
    } catch (err) {
        console.error("Erro ao criar projeto:", err);
        return res.status(500).json({
            erro: "Erro ao criar projeto."
        });
    }
});

router.get("/", auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                projetos.*,
                tijolos.tipo,
                tijolos.comprimento,
                tijolos.largura,
                tijolos.altura
             FROM projetos
             INNER JOIN tijolos ON projetos.tijolo_id = tijolos.id
             WHERE projetos.usuario_id = $1
             ORDER BY projetos.data_criacao DESC`,
            [req.session.usuario.id]
        );

        return res.json(result.rows);
    } catch (err) {
        console.error("Erro ao listar projetos:", err);
        return res.status(500).json({
            erro: "Erro ao carregar projetos."
        });
    }
});

router.get("/:id", auth, async (req, res) => {
    const projetoId = Number(req.params.id);

    if (!Number.isInteger(projetoId) || projetoId <= 0) {
        return res.status(400).json({
            erro: "Projeto inválido."
        });
    }

    try {
        const result = await pool.query(
            `SELECT
                projetos.*,
                tijolos.tipo,
                tijolos.comprimento,
                tijolos.largura,
                tijolos.altura
             FROM projetos
             INNER JOIN tijolos ON projetos.tijolo_id = tijolos.id
             WHERE projetos.id = $1
               AND projetos.usuario_id = $2`,
            [projetoId, req.session.usuario.id]
        );

        if (!result.rowCount) {
            return res.status(404).json({
                erro: "Projeto não encontrado."
            });
        }

        return res.json(result.rows[0]);
    } catch (err) {
        console.error("Erro ao buscar projeto:", err);
        return res.status(500).json({
            erro: "Erro ao buscar projeto."
        });
    }
});

router.put("/:id", auth, async (req, res) => {
    const projetoId = Number(req.params.id);
    const nomeProjeto = String(req.body.nome_projeto || "").trim();
    const tijoloId = Number(req.body.tijolo_id);
    const areaParede = Number(req.body.area_parede);
    const espessuraJunta = Number(req.body.espessura_junta);

    if (
        !Number.isInteger(projetoId) ||
        projetoId <= 0 ||
        !nomeProjeto ||
        !Number.isInteger(tijoloId) ||
        tijoloId <= 0 ||
        !Number.isFinite(areaParede) ||
        areaParede <= 0 ||
        !Number.isFinite(espessuraJunta) ||
        espessuraJunta < 0
    ) {
        return res.status(400).json({
            erro: "Preencha os dados do projeto corretamente."
        });
    }

    try {
        const result = await pool.query(
            `UPDATE projetos
             SET nome_projeto = $1,
                 tijolo_id = $2,
                 area_parede = $3,
                 espessura_junta = $4
             WHERE id = $5
               AND usuario_id = $6`,
            [
                nomeProjeto,
                tijoloId,
                areaParede,
                espessuraJunta,
                projetoId,
                req.session.usuario.id
            ]
        );

        if (!result.rowCount) {
            return res.status(404).json({
                erro: "Projeto não encontrado."
            });
        }

        return res.json({
            mensagem: "Projeto atualizado."
        });
    } catch (err) {
        console.error("Erro ao atualizar projeto:", err);
        return res.status(500).json({
            erro: "Erro ao atualizar projeto."
        });
    }
});

router.delete("/:id", auth, async (req, res) => {
    const projetoId = Number(req.params.id);

    if (!Number.isInteger(projetoId) || projetoId <= 0) {
        return res.status(400).json({
            erro: "Projeto inválido."
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const ownedProject = await client.query(
            `SELECT id
             FROM projetos
             WHERE id = $1 AND usuario_id = $2
             FOR UPDATE`,
            [projetoId, req.session.usuario.id]
        );

        if (!ownedProject.rowCount) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                erro: "Projeto não encontrado."
            });
        }

        await client.query(
            `DELETE FROM calculos WHERE projeto_id = $1`,
            [projetoId]
        );

        await client.query(
            `DELETE FROM projetos
             WHERE id = $1 AND usuario_id = $2`,
            [projetoId, req.session.usuario.id]
        );

        await client.query("COMMIT");

        return res.json({
            mensagem: "Projeto removido."
        });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Erro ao remover projeto:", err);
        return res.status(500).json({
            erro: "Erro ao remover projeto."
        });
    } finally {
        client.release();
    }
});

module.exports = router;
