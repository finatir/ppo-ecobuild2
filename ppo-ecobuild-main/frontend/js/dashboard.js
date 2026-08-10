const nomeUsuario =
    document.getElementById(
        "nomeUsuario"
    );

const totalProjetos =
    document.getElementById(
        "totalProjetos"
    );

const listaProjetos =
    document.getElementById(
        "listaProjetos"
    );

const logout =
    document.getElementById(
        "logout"
    );


// ========================================
// CARREGAR USUÁRIO
// ========================================

async function carregarUsuario() {

    try {

        const resposta =
            await fetch(
                `${API_URL}/auth/me`,
                {
                    credentials:
                        "include"
                }
            );


        if (!resposta.ok) {

            window.location.href =
                "login.html";

            return;

        }


        const usuario =
            await resposta.json();


        nomeUsuario.textContent =
            usuario.nome;


    } catch (erro) {

        console.error(
            "Erro ao carregar usuário:",
            erro
        );

        window.location.href =
            "login.html";

    }

}


// ========================================
// CARREGAR PROJETOS
// ========================================

async function carregarProjetos() {

    try {

        const resposta =
            await fetch(
                `${API_URL}/projetos`,
                {
                    credentials:
                        "include"
                }
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar projetos."
            );

        }


        const projetos =
            await resposta.json();


        totalProjetos.textContent =
            projetos.length;


        if (
            projetos.length === 0
        ) {

            listaProjetos.innerHTML = `

                <div class="empty">

                    <h3>
                        Nenhum projeto cadastrado
                    </h3>

                    <p>
                        Comece criando seu primeiro projeto.
                    </p>

                    <a
                        href="projetos.html"
                        class="button"
                    >
                        Criar projeto
                    </a>

                </div>

            `;

            return;

        }


        listaProjetos.innerHTML =
            projetos
                .slice(0, 5)
                .map(
                    projeto => `

                        <div
                            class="projeto-card"
                        >

                            <div>

                                <h3>
                                    ${
                                        projeto.nome_projeto
                                    }
                                </h3>

                                <p>
                                    Tijolo:
                                    ${
                                        projeto.tipo ||
                                        "Não informado"
                                    }
                                </p>

                            </div>

                            <div>

                                <strong>
                                    ${
                                        projeto.area_parede
                                    }
                                    m²
                                </strong>

                            </div>

                        </div>

                    `
                )
                .join("");


    } catch (erro) {

        console.error(
            "Erro:",
            erro
        );


        listaProjetos.innerHTML = `

            <div class="error">

                Não foi possível carregar
                seus projetos.

            </div>

        `;

    }

}


// ========================================
// LOGOUT
// ========================================

logout.addEventListener(
    "click",
    async (event) => {

        event.preventDefault();


        try {

            await fetch(
                `${API_URL}/auth/logout`,
                {

                    method: "POST",

                    credentials:
                        "include"

                }
            );


            window.location.href =
                "login.html";


        } catch (erro) {

            console.error(
                "Erro ao sair:",
                erro
            );

        }

    }
);


// ========================================
// INICIALIZAÇÃO
// ========================================

async function iniciarDashboard() {

    await carregarUsuario();

    await carregarProjetos();

}


iniciarDashboard();