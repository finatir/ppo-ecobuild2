const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const cors = require("cors");
const path = require("path");

const {
    pool,
    initializeDatabase,
    closeDatabase
} = require("./database");

const authRoutes = require("./routes/auth");
const projetosRoutes = require("./routes/projetos");
const calculosRoutes = require("./routes/calculos");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const frontendPath = path.join(__dirname, "..", "frontend");

app.disable("x-powered-by");

if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

// Permite Live Server/Codespaces durante o desenvolvimento.
// Em produção o frontend e a API usam a mesma origem.
app.use(
    cors({
        origin(origin, callback) {
            if (!origin) {
                return callback(null, true);
            }

            try {
                const url = new URL(origin);
                const hostname = url.hostname;

                const local =
                    url.protocol === "http:" &&
                    (hostname === "localhost" ||
                        hostname === "127.0.0.1");

                const codespaces =
                    url.protocol === "https:" &&
                    hostname.endsWith(".app.github.dev");

                return callback(null, local || codespaces);
            } catch {
                return callback(null, false);
            }
        },
        credentials: true
    })
);

app.use(express.json({ limit: "1mb" }));

const sessionStore = new pgSession({
    pool,
    tableName: "session",
    createTableIfMissing: true
});

app.use(
    session({
        store: sessionStore,
        secret:
            process.env.SESSION_SECRET ||
            "ecobuild-dev-secret-troque-em-producao",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        }
    })
);

app.use(express.static(frontendPath));

app.use("/auth", authRoutes);
app.use("/projetos", projetosRoutes);
app.use("/calculos", calculosRoutes);

app.get("/health", async (req, res) => {
    res.status(200).json({
        sistema: "EcoBuild API",
        status: "online"
    });
});

app.get("/api-status", (req, res) => {
    res.json({
        sistema: "EcoBuild API",
        status: "online"
    });
});

app.get("/", (req, res) => {
    res.sendFile(
        path.join(frontendPath, "index.html")
    );
});

app.use("/auth", (req, res) => {
    res.status(404).json({
        erro: "Rota de autenticação não encontrada."
    });
});

app.use("/projetos", (req, res) => {
    res.status(404).json({
        erro: "Rota de projetos não encontrada."
    });
});

app.use("/calculos", (req, res) => {
    res.status(404).json({
        erro: "Rota de cálculos não encontrada."
    });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        erro: "Erro interno do servidor."
    });
});

let server;

async function iniciar() {
    try {
        await initializeDatabase();

        server = app.listen(
            PORT,
            "0.0.0.0",
            () => {
                console.log(
                    `EcoBuild rodando na porta ${PORT}`
                );
            }
        );
    } catch (err) {
        console.error(
            "Não foi possível inicializar o EcoBuild:",
            err
        );
        process.exit(1);
    }
}

async function encerrar(signal) {
    console.log(`Recebido ${signal}. Encerrando...`);

    if (server) {
        server.close(async () => {
            await closeDatabase();
            process.exit(0);
        });
    } else {
        await closeDatabase();
        process.exit(0);
    }
}

process.on("SIGINT", () => encerrar("SIGINT"));
process.on("SIGTERM", () => encerrar("SIGTERM"));

iniciar();
