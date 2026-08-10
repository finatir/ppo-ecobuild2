const parametros = new URLSearchParams(window.location.search);
const projetoId = parametros.get("projeto_id");

const nomeUsuario = document.getElementById("nomeUsuario");
const projetoInfo = document.getElementById("projetoInfo");
const calculadoraForm = document.getElementById("calculadoraForm");
const mensagem = document.getElementById("mensagem");
const resultados = document.getElementById("resultados");
const historico = document.getElementById("historico");
const logout = document.getElementById("logout");

async function carregarUsuario() {
    try {
        const resposta = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
        if (!resposta.ok) {
            window.location.href = "login.html";
            return false;
        }
        const usuario = await resposta.json();
        nomeUsuario.textContent = usuario.nome;
        return true;
    } catch {
        window.location.href = "login.html";
        return false;
    }
}

async function carregarProjeto() {
    if (!projetoId) {
        projetoInfo.innerHTML = `<div class="error"><p>Nenhum projeto foi selecionado.</p><a href="projetos.html" class="button">Voltar para projetos</a></div>`;
        calculadoraForm.style.display = "none";
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/projetos/${projetoId}`, { credentials: "include" });
        if (resposta.status === 401) return window.location.href = "login.html";
        if (!resposta.ok) throw new Error("Projeto não encontrado.");

        const projeto = await resposta.json();
        if (!projeto) throw new Error("Projeto não encontrado.");

        projetoInfo.innerHTML = `
            <h3>${projeto.nome_projeto}</h3>
            <p><strong>Tipo:</strong> ${projeto.tipo || "Não informado"}</p>
            <p><strong>Dimensões:</strong> ${projeto.comprimento} × ${projeto.largura} × ${projeto.altura} cm</p>
            <p><strong>Área da parede:</strong> ${projeto.area_parede} m²</p>
            <p><strong>Espessura da junta:</strong> ${projeto.espessura_junta} cm</p>`;

        document.getElementById("area_total").value = projeto.area_parede;
        document.getElementById("espessura_junta").value = projeto.espessura_junta;
        document.getElementById("altura_tijolo").value = projeto.altura || "";
        document.getElementById("comprimento_tijolo").value = projeto.comprimento || "";
        document.getElementById("largura_tijolo").value = projeto.largura || "";

        await carregarHistorico();
    } catch (erro) {
        projetoInfo.innerHTML = `<div class="error">${erro.message}</div>`;
    }
}

calculadoraForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const area = Number(document.getElementById("area_total").value);
    const altura = Number(document.getElementById("altura_tijolo").value);
    const comprimento = Number(document.getElementById("comprimento_tijolo").value);
    const largura = Number(document.getElementById("largura_tijolo").value);
    const junta = Number(document.getElementById("espessura_junta").value);

    if (!projetoId) return mostrarMensagem("Selecione um projeto primeiro.", "erro");
    if (area <= 0 || altura <= 0 || comprimento <= 0 || largura <= 0 || junta < 0) {
        return mostrarMensagem("Informe valores válidos em todos os campos.", "erro");
    }

    // Todas as medidas dos tijolos entram em centímetros; convertemos para metros.
    const l = comprimento / 100;
    const h = altura / 100;
    const w = largura / 100;
    const j = junta / 100;

    // Área ocupada por um módulo tijolo + junta.
    const areaModulo = (l + j) * (h + j);
    const qtdTijolos = Math.ceil(area / areaModulo);

    // Estimativa geométrica da argamassa: volume da parede menos o volume
    // dos tijolos teóricos. O arredondamento da quantidade não aumenta a argamassa.
    const qtdTeorica = area / areaModulo;
    const volumeParede = area * w;
    const volumeTijolos = qtdTeorica * l * h * w;
    const volumeArgamassa = Math.max(0, Number((volumeParede - volumeTijolos).toFixed(3)));

    document.getElementById("resultadoTijolos").textContent = qtdTijolos.toLocaleString("pt-BR");
    document.getElementById("resultadoArgamassa").textContent = volumeArgamassa.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    document.getElementById("resultadoArea").textContent = area.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
    resultados.style.display = "grid";
    mostrarMensagem("Cálculo realizado com sucesso!", "sucesso");

    try {
        const resposta = await fetch(`${API_URL}/calculos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                projeto_id: Number(projetoId),
                qtd_tijolos: qtdTijolos,
                volume_argamassa: volumeArgamassa,
                area_total: area
            })
        });

        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.erro || "Erro ao salvar cálculo.");
        await carregarHistorico();
    } catch (erro) {
        mostrarMensagem(`Cálculo feito, mas não foi salvo: ${erro.message}`, "erro");
    }
});

async function carregarHistorico() {
    try {
        const resposta = await fetch(`${API_URL}/calculos/historico/${projetoId}`, { credentials: "include" });
        if (!resposta.ok) throw new Error("Erro ao buscar histórico.");
        const calculos = await resposta.json();

        if (!calculos.length) {
            historico.innerHTML = "<p>Nenhum cálculo realizado ainda.</p>";
            return;
        }

        historico.innerHTML = calculos.map(calculo => `
            <div class="projeto-card">
                <h3>Cálculo realizado</h3>
                <p><strong>Tijolos:</strong> ${calculo.qtd_tijolos} unidades</p>
                <p><strong>Argamassa:</strong> ${Number(calculo.volume_argamassa).toLocaleString("pt-BR", {maximumFractionDigits:3})} m³</p>
                <p><strong>Área:</strong> ${calculo.area_total} m²</p>
                <p><strong>Data:</strong> ${new Date(calculo.data_calculo).toLocaleString("pt-BR")}</p>
            </div>`).join("");
    } catch (erro) {
        historico.innerHTML = `<p class="error">${erro.message}</p>`;
    }
}

function mostrarMensagem(texto, tipo = "") {
    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;
}

logout.addEventListener("click", async (event) => {
    event.preventDefault();
    try {
        await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
    } finally {
        window.location.href = "login.html";
    }
});

(async function iniciar() {
    if (await carregarUsuario()) await carregarProjeto();
})();
