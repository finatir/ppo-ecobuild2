const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

// Local: backend/database/ecobuild.db
// Online: define DB_PATH=/var/data/ecobuild.db (persistent disk)
const databasePath = process.env.DB_PATH || path.join(
    __dirname,
    "database",
    "ecobuild.db"
);

const databaseDirectory = path.dirname(databasePath);
fs.mkdirSync(databaseDirectory, { recursive: true });

console.log("Banco utilizado:");
console.log(databasePath);

const db = new sqlite3.Database(databasePath, (err) => {
    if (err) {
        console.error("Erro ao abrir banco:", err.message);
        return;
    }

    console.log("Conexão com SQLite estabelecida.");
});

db.run("PRAGMA foreign_keys = ON");
db.run("PRAGMA journal_mode = WAL");

const schemaPath = path.join(
    __dirname,
    "database",
    "schema.sql"
);

const schema = fs.readFileSync(schemaPath, "utf8");

db.exec(schema, (err) => {
    if (err) {
        console.error("Erro ao executar schema:", err.message);
        return;
    }

    console.log("Banco inicializado corretamente.");
});

module.exports = db;
