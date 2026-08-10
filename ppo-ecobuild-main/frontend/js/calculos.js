const express = require("express");

const db = require("../database");

const auth = require("../middleware/auth");

const router = express.Router();


// ========================================
// REALIZAR CÁLCULO
// ========================================

router.post("/", auth, (req, res) => {

    const {
        projeto_id,
        modelo_id,
        qtd_tijolos,
        volume_argamassa,
        area_total
    } = req.body;


    // ========================================
    // VALIDAR DADOS
    // ========================================

    if (
        !projeto_id ||
        qtd_tijolos === undefined ||
        volume_argamassa === undefined ||
        area_total === undefined
    ) {

        return res.status(400).json({

            erro:
                "Preencha todos os dados obrigatórios."

        });

    }


    // ========================================
    // VERIFICAR SE O PROJETO PERTENCE AO USUÁRIO
    // ========================================

    db.get(

        `
        SELECT *

        FROM projetos

        WHERE id = ?

        AND usuario_id = ?
        `,

        [
            projeto_id,
            req.session.usuario.id
        ],

        (err, projeto) => {

            if (err) {

                console.error(
                    "Erro ao buscar projeto:",
                    err
                );

                return res.status(500).json({

                    erro:
                        "Erro ao verificar projeto."

                });

            }


            if (!projeto) {

                return res.status(404).json({

                    erro:
                        "Projeto não encontrado."

                });

            }


            // ========================================
            // SALVAR CÁLCULO
            // ========================================

            db.run(

                `
                INSERT INTO calculos (

                    projeto_id,

                    modelo_id,

                    qtd_tijolos,

                    volume_argamassa,

                    area_total

                )

                VALUES (?, ?, ?, ?, ?)
                `,

                [

                    projeto_id,

                    modelo_id || null,

                    qtd_tijolos,

                    volume_argamassa,

                    area_total

                ],

                function (err) {

                    if (err) {

                        console.error(
                            "Erro ao salvar cálculo:",
                            err
                        );

                        return res.status(500).json({

                            erro:
                                err.message

                        });

                    }


                    res.status(201).json({

                        mensagem:
                            "Cálculo salvo com sucesso.",

                        id:
                            this.lastID

                    });

                }

            );

        }

    );

});


// ========================================
// HISTÓRICO DE CÁLCULOS
// ========================================

router.get(
    "/historico/:projetoId",
    auth,
    (req, res) => {

        db.all(

            `
            SELECT

                calculos.*,

                modelos_pre_definidos.nome
                AS modelo_nome

            FROM calculos

            LEFT JOIN modelos_pre_definidos

            ON calculos.modelo_id =
               modelos_pre_definidos.id

            INNER JOIN projetos

            ON calculos.projeto_id =
               projetos.id

            WHERE calculos.projeto_id = ?

            AND projetos.usuario_id = ?

            ORDER BY calculos.data_calculo DESC
            `,

            [

                req.params.projetoId,

                req.session.usuario.id

            ],

            (err, rows) => {

                if (err) {

                    console.error(
                        "Erro ao buscar histórico:",
                        err
                    );

                    return res.status(500).json({

                        erro:
                            err.message

                    });

                }


                res.json(rows);

            }

        );

    }

);


module.exports = router;