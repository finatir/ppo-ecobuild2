function auth(req, res, next) {

    if (
        !req.session ||
        !req.session.usuario
    ) {

        return res.status(401).json({

            erro:
                "Usuário não autenticado."

        });

    }

    next();

}

module.exports = auth;