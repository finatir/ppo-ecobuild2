const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const databasePath = path.join(
    __dirname,
    "database",
    "ecobuild.db"
);

console.log("Banco utilizado:");
console.log(databasePath);

const db = new sqlite3.Database(
    databasePath,
    (err) => {

        if (err) {

            console.error(
                "Erro ao abrir banco:",
                err.message
            );

            return;
        }

        console.log(
            "Conexão com SQLite estabelecida."
        );

    }
);

const schemaPath = path.join(
    __dirname,
    "database",
    "schema.sql"
);

const schema = fs.readFileSync(
    schemaPath,
    "utf8"
);

db.exec(schema, (err) => {

    if (err) {

        console.error(
            "Erro ao executar schema:",
            err.message
        );

        return;
    }

    console.log(
        "Banco inicializado corretamente."
    );

});

module.exports = db;