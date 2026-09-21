const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error(
        "DATABASE_URL não foi definida. No Render, ela é preenchida automaticamente pelo render.yaml. Para rodar localmente, defina DATABASE_URL apontando para um PostgreSQL."
    );
}

const isExternalConnection =
    databaseUrl.includes("?sslmode=require") ||
    databaseUrl.includes("sslmode=require&");

const pool = new Pool({
    connectionString: databaseUrl,
    max: Number(process.env.DB_POOL_MAX) || 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: isExternalConnection ? { rejectUnauthorized: false } : undefined
});

pool.on("error", (err) => {
    console.error("Erro inesperado no pool do PostgreSQL:", err);
});

async function initializeDatabase() {
    const client = await pool.connect();

    try {
        const schemaPath = path.join(
            __dirname,
            "database",
            "schema.sql"
        );

        const schema = fs.readFileSync(schemaPath, "utf8");

        await client.query(schema);

        console.log("Conexão com PostgreSQL estabelecida.");
        console.log("Banco inicializado corretamente.");
    } finally {
        client.release();
    }
}

async function closeDatabase() {
    await pool.end();
}

module.exports = {
    pool,
    initializeDatabase,
    closeDatabase
};
