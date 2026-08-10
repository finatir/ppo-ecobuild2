const express = require("express");
const session = require("express-session");
const path = require("path");

const authRoutes = require("./routes/auth");
const projetosRoutes = require("./routes/projetos");
const calculosRoutes = require("./routes/calculos");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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

// O frontend e a API são servidos pela mesma aplicação.
// Isso elimina localhost/URL fixa do código do navegador.
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

app.use("/auth", authRoutes);
app.use("/projetos", projetosRoutes);
app.use("/calculos", calculosRoutes);

app.get("/api-status", (req, res) => {
    res.json({ sistema: "EcoBuild API", status: "online" });
});

app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`EcoBuild rodando na porta ${PORT}`);
});
