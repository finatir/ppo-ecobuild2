const express = require("express");

const db = require("../database");

const auth = require("../middleware/auth");

const router = express.Router();

/* REALIZAR CÁLCULO */

router.post("/", auth, (req, res) => {

    const {

        projeto_id,

        modelo_id

    } = req.body;

    db.get(

        `
        SELECT
            projetos.area_parede,
            projetos.espessura_junta,
            tijolos.comprimento,
            tijolos.altura

        FROM projetos

        INNER JOIN tijolos

        ON projetos.tijolo_id=tijolos.id

        WHERE projetos.id=?
        `,

        [

            projeto_id

        ],

        (err, projeto) => {

            if (err) {

                return res.status(500).json({

                    erro: err.message

                });

            }

            if (!projeto) {

                return res.status(404).json({

                    erro: "Projeto não encontrado."

                });

            }

            const areaTijolo =
                (projeto.comprimento / 100) *
                (projeto.altura / 100);

            const qtd_tijolos =
                Math.ceil(projeto.area_parede / areaTijolo);

            const volume_argamassa =
                Number((projeto.area_parede * 0.02).toFixed(2));

            db.run(

                `
                INSERT INTO calculos(

                    projeto_id,
                    modelo_id,
                    qtd_tijolos,
                    volume_argamassa,
                    area_total

                )

                VALUES(?,?,?,?,?)
                `,

                [

                    projeto_id,

                    modelo_id,

                    qtd_tijolos,

                    volume_argamassa,

                    projeto.area_parede

                ],

                function(err){

                    if(err){

                        return res.status(500).json({

                            erro:err.message

                        });

                    }

                    res.json({

                        id:this.lastID,

                        qtd_tijolos,

                        volume_argamassa,

                        area_total:projeto.area_parede

                    });

                }

            );

        }

    );

});

/* HISTÓRICO */

router.get("/", auth, (req,res)=>{

    db.all(

        `
        SELECT

            calculos.*,

            projetos.nome_projeto

        FROM calculos

        INNER JOIN projetos

        ON calculos.projeto_id=projetos.id

        ORDER BY data_calculo DESC
        `,

        [],

        (err,rows)=>{

            if(err){

                return res.status(500).json({

                    erro:err.message

                });

            }

            res.json(rows);

        }

    );

});

module.exports = router;