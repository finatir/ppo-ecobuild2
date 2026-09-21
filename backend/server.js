const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const projetosRoutes = require("./routes/projetos");
const calculosRoutes = require("./routes/calculos");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const frontendPath = path.join(__dirname, "..", "frontend");

app.disable("x-powered-by");

// Render termina HTTPS no proxy e encaminha a requisição ao Node.
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

// Mantido para facilitar testes com Live Server e outros frontends locais.
// Em produção, o frontend e a API usam a mesma origem.
app.use(cors({
    origin(origin, callback) {
        if (!origin) return callback(null, true);

        try {
            const url = new URL(origin);
            const local =
                (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
                url.protocol === "http:";
            const codespaces =
                url.hostname.endsWith(".app.github.dev") &&
                url.protocol === "https:";

            if (local || codespaces) return callback(null, true);
            return callback(null, false);
        } catch {
            return callback(null, false);
        }
    },
    credentials: true
}));

app.use(express.json({ limit: "1mb" }));

app.use(session({
    secret: process.env.SESSION_SECRET || "ecobuild-dev-secret-troque-em-producao",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    }
}));

// Frontend e API no mesmo domínio.
app.use(express.static(frontendPath));

app.use("/auth", authRoutes);
app.use("/projetos", projetosRoutes);
app.use("/calculos", calculosRoutes);

app.get("/health", (req, res) => {
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

// Página inicial quando o Express estiver servindo tudo.
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// Erros de API devem retornar JSON, não o HTML da página inicial.
app.use("/auth", (req, res) => {
    res.status(404).json({ erro: "Rota de autenticação não encontrada." });
});

app.use("/projetos", (req, res) => {
    res.status(404).json({ erro: "Rota de projetos não encontrada." });
});

app.use("/calculos", (req, res) => {
    res.status(404).json({ erro: "Rota de cálculos não encontrada." });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ erro: "Erro interno do servidor." });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`EcoBuild rodando na porta ${PORT}`);
});
