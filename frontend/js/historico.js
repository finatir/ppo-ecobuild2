const tabela = document.getElementById("historico");
const nomeUsuario = document.getElementById("nomeUsuario");
const logout = document.getElementById("logout");

async function carregarUsuario() {
    try {
        const resposta = await fetch(`${API_URL}/auth/me`, {
            credentials: "include"
        });

        if (!resposta.ok) {
            window.location.href = "login.html";
            return false;
        }

        const usuario = await resposta.json();
        if (nomeUsuario) nomeUsuario.textContent = usuario.nome;
        return true;
    } catch (erro) {
        console.error(erro);
        window.location.href = "login.html";
        return false;
    }
}

async function carregarHistorico() {
    if (!tabela) return;

    try {
        const resposta = await fetch(`${API_URL}/calculos`, {
            credentials: "include"
        });

        if (resposta.status === 401) {
            window.location.href = "login.html";
            return;
        }

        const dados = await resposta.json();
        if (!resposta.ok) {
            throw new Error(dados.erro || "Erro ao carregar histórico.");
        }

        if (!dados.length) {
            tabela.innerHTML = `
                <div class="empty">
                    <h3>Nenhum cálculo realizado</h3>
                    <p>Quando você calcular um projeto, ele aparecerá aqui.</p>
                    <a href="projetos.html" class="button">Ir para projetos</a>
                </div>
            `;
            return;
        }

        tabela.innerHTML = dados.map(item => `
            <div class="projeto-card">
                <div>
                    <h3>${item.nome_projeto}</h3>
                    <p><strong>Tijolos:</strong> ${Number(item.qtd_tijolos).toLocaleString("pt-BR")}</p>
                    <p><strong>Argamassa:</strong> ${Number(item.volume_argamassa).toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} m³</p>
                    <p><strong>Área:</strong> ${Number(item.area_total).toLocaleString("pt-BR")} m²</p>
                    <p><strong>Data:</strong> ${new Date(item.data_calculo).toLocaleString("pt-BR")}</p>
                </div>
                <a href="calculadora.html?projeto_id=${item.projeto_id}" class="button">Ver cálculo</a>
            </div>
        `).join("");
    } catch (erro) {
        tabela.innerHTML = `
            <div class="error">
                <h3>Não foi possível carregar o histórico</h3>
                <p>${erro.message}</p>
            </div>
        `;
    }
}

if (logout) {
    logout.addEventListener("click", async (event) => {
        event.preventDefault();
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                credentials: "include"
            });
        } finally {
            window.location.href = "login.html";
        }
    });
}

(async function iniciar() {
    if (await carregarUsuario()) {
        await carregarHistorico();
    }
})();
