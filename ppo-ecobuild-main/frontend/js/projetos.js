// ========================================
// CONFIGURAÇÃO
// ========================================

// O API_URL vem do arquivo api.js
// Não coloque a URL diretamente aqui.
//
// No projetos.html deve existir:
//
// <script src="../js/api.js"></script>
// <script src="../js/projetos.js"></script>


// ========================================
// ELEMENTOS DA PÁGINA
// ========================================

const projetoForm =
    document.getElementById("projetoForm");

const listaProjetos =
    document.getElementById("listaProjetos");

const mensagem =
    document.getElementById("mensagem");

const nomeUsuario =
    document.getElementById("nomeUsuario");

const logout =
    document.getElementById("logout");

const atualizarProjetos =
    document.getElementById("atualizarProjetos");


// ========================================
// CARREGAR USUÁRIO LOGADO
// ========================================

async function carregarUsuario() {

    try {

        const resposta = await fetch(
            `${API_URL}/auth/me`,
            {
                method: "GET",
                credentials: "include"
            }
        );


        // ========================================
        // USUÁRIO NÃO ESTÁ AUTENTICADO
        // ========================================

        if (!resposta.ok) {

            window.location.href =
                "login.html";

            return false;

        }


        const usuario =
            await resposta.json();


        // ========================================
        // MOSTRAR NOME DO USUÁRIO
        // ========================================

        if (nomeUsuario) {

            nomeUsuario.textContent =
                usuario.nome;

        }


        return true;


    } catch (erro) {

        console.error(
            "Erro ao carregar usuário:",
            erro
        );


        window.location.href =
            "login.html";


        return false;

    }

}


// ========================================
// CARREGAR PROJETOS
// ========================================

async function carregarProjetos() {

    if (!listaProjetos) {

        return;

    }


    // ========================================
    // MENSAGEM DE CARREGAMENTO
    // ========================================

    listaProjetos.innerHTML = `

        <div class="loading">

            <p>
                Carregando projetos...
            </p>

        </div>

    `;


    try {

        const resposta = await fetch(

            `${API_URL}/projetos`,

            {

                method: "GET",

                credentials: "include"

            }

        );


        // ========================================
        // SESSÃO EXPIRADA
        // ========================================

        if (
            resposta.status === 401
        ) {

            window.location.href =
                "login.html";

            return;

        }


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar os projetos."
            );

        }


        const projetos =
            await resposta.json();


        console.log(
            "Projetos recebidos do servidor:",
            projetos
        );


        mostrarProjetos(
            projetos
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar projetos:",
            erro
        );


        listaProjetos.innerHTML = `

            <div class="error">

                <h3>
                    Erro ao carregar projetos
                </h3>

                <p>
                    ${erro.message}
                </p>

                <br>

                <button
                    type="button"
                    onclick="carregarProjetos()"
                >
                    Tentar novamente
                </button>

            </div>

        `;

    }

}


// ========================================
// MOSTRAR PROJETOS NA TELA
// ========================================

function mostrarProjetos(projetos) {

    if (!listaProjetos) {

        return;

    }


    // ========================================
    // NENHUM PROJETO
    // ========================================

    if (
        !projetos ||
        projetos.length === 0
    ) {

        listaProjetos.innerHTML = `

            <div class="empty">

                <h3>
                    Nenhum projeto cadastrado
                </h3>

                <p>
                    Crie seu primeiro projeto
                    usando o formulário acima.
                </p>

            </div>

        `;

        return;

    }


    // ========================================
    // CRIAR CARDS DOS PROJETOS
    // ========================================

    listaProjetos.innerHTML = projetos
        .map((projeto) => {


            // ========================================
            // FORMATAR DATA
            // ========================================

            let dataFormatada =
                "Não informada";


            if (
                projeto.data_criacao
            ) {

                const data =
                    new Date(
                        projeto.data_criacao
                    );


                if (
                    !isNaN(
                        data.getTime()
                    )
                ) {

                    dataFormatada =
                        data.toLocaleDateString(
                            "pt-BR"
                        );

                }

            }


            // ========================================
            // RETORNAR CARD
            // ========================================

            return `

                <div
                    class="projeto-card"
                >

                    <div
                        class="projeto-info"
                    >

                        <h3>
                            ${projeto.nome_projeto}
                        </h3>


                        <p>

                            <strong>
                                Tipo de tijolo:
                            </strong>

                            ${
                                projeto.tipo ||
                                "Não informado"
                            }

                        </p>


                        <p>

                            <strong>
                                Dimensões:
                            </strong>

                            ${
                                projeto.comprimento ||
                                "-"
                            }

                            ×

                            ${
                                projeto.largura ||
                                "-"
                            }

                            ×

                            ${
                                projeto.altura ||
                                "-"
                            }

                            cm

                        </p>


                        <p>

                            <strong>
                                Área da parede:
                            </strong>

                            ${
                                projeto.area_parede
                            }

                            m²

                        </p>


                        <p>

                            <strong>
                                Espessura da junta:
                            </strong>

                            ${
                                projeto.espessura_junta
                            }

                            cm

                        </p>


                        <p>

                            <strong>
                                Criado em:
                            </strong>

                            ${dataFormatada}

                        </p>

                    </div>


                    <div
                        class="projeto-acoes"
                    >

                        <!-- CALCULADORA -->

                        <a
                            href="calculadora.html?projeto_id=${projeto.id}"
                            class="button"
                        >

                            Calcular

                        </a>


                        <!-- EXCLUIR -->

                        <button
                            type="button"
                            class="button button-danger"
                            onclick="excluirProjeto(${projeto.id})"
                        >

                            Excluir

                        </button>

                    </div>

                </div>

            `;

        })
        .join("");

}


// ========================================
// CRIAR PROJETO
// ========================================

if (projetoForm) {

    projetoForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // ========================================
            // PEGAR VALORES
            // ========================================

            const nomeProjetoInput =
                document.getElementById(
                    "nome_projeto"
                );


            const tijoloInput =
                document.getElementById(
                    "tijolo_id"
                );


            const areaInput =
                document.getElementById(
                    "area_parede"
                );


            const juntaInput =
                document.getElementById(
                    "espessura_junta"
                );


            // ========================================
            // VERIFICAR ELEMENTOS
            // ========================================

            if (
                !nomeProjetoInput ||
                !tijoloInput ||
                !areaInput ||
                !juntaInput
            ) {

                console.error(
                    "Um ou mais campos do formulário não foram encontrados."
                );

                return;

            }


            // ========================================
            // PEGAR VALORES
            // ========================================

            const nome_projeto =
                nomeProjetoInput.value.trim();


            const tijolo_id =
                Number(
                    tijoloInput.value
                );


            const area_parede =
                Number(
                    areaInput.value
                );


            const espessura_junta =
                Number(
                    juntaInput.value
                );


            // ========================================
            // VALIDAR DADOS
            // ========================================

            if (
                !nome_projeto
            ) {

                mostrarMensagem(
                    "Digite o nome do projeto.",
                    "erro"
                );

                return;

            }


            if (
                !tijolo_id ||
                tijolo_id <= 0
            ) {

                mostrarMensagem(
                    "Selecione um tijolo.",
                    "erro"
                );

                return;

            }


            if (
                !area_parede ||
                area_parede <= 0
            ) {

                mostrarMensagem(
                    "Informe uma área de parede válida.",
                    "erro"
                );

                return;

            }


            if (
                espessura_junta < 0
            ) {

                mostrarMensagem(
                    "Informe uma espessura de junta válida.",
                    "erro"
                );

                return;

            }


            // ========================================
            // MENSAGEM DE CARREGAMENTO
            // ========================================

            mostrarMensagem(
                "Criando projeto...",
                ""
            );


            try {

                // ========================================
                // ENVIAR PARA O BACKEND
                // ========================================

                const resposta =
                    await fetch(

                        `${API_URL}/projetos`,

                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            credentials:
                                "include",

                            body:
                                JSON.stringify({

                                    nome_projeto:
                                        nome_projeto,

                                    tijolo_id:
                                        tijolo_id,

                                    area_parede:
                                        area_parede,

                                    espessura_junta:
                                        espessura_junta

                                })

                        }

                    );


                // ========================================
                // LER RESPOSTA
                // ========================================

                const dados =
                    await resposta.json();


                console.log(
                    "Resposta do servidor:",
                    dados
                );


                // ========================================
                // SESSÃO EXPIRADA
                // ========================================

                if (
                    resposta.status === 401
                ) {

                    window.location.href =
                        "login.html";

                    return;

                }


                // ========================================
                // ERRO
                // ========================================

                if (
                    !resposta.ok
                ) {

                    throw new Error(

                        dados.erro ||
                        "Erro ao criar projeto."

                    );

                }


                // ========================================
                // SUCESSO
                // ========================================

                mostrarMensagem(

                    "Projeto criado com sucesso!",

                    "sucesso"

                );


                // ========================================
                // LIMPAR FORMULÁRIO
                // ========================================

                projetoForm.reset();


                // ========================================
                // ATUALIZAR LISTA
                // ========================================

                await carregarProjetos();


            } catch (erro) {

                console.error(
                    "Erro ao criar projeto:",
                    erro
                );


                mostrarMensagem(

                    erro.message ||
                    "Erro ao criar projeto.",

                    "erro"

                );

            }

        }
    );

}


// ========================================
// EXCLUIR PROJETO
// ========================================

async function excluirProjeto(id) {

    // ========================================
    // CONFIRMAR EXCLUSÃO
    // ========================================

    const confirmar =
        window.confirm(

            "Tem certeza que deseja excluir este projeto?"

        );


    if (!confirmar) {

        return;

    }


    try {

        const resposta =
            await fetch(

                `${API_URL}/projetos/${id}`,

                {

                    method:
                        "DELETE",

                    credentials:
                        "include"

                }

            );


        const dados =
            await resposta.json();


        console.log(
            "Resposta ao excluir:",
            dados
        );


        // ========================================
        // SESSÃO EXPIRADA
        // ========================================

        if (
            resposta.status === 401
        ) {

            window.location.href =
                "login.html";

            return;

        }


        // ========================================
        // ERRO
        // ========================================

        if (
            !resposta.ok
        ) {

            throw new Error(

                dados.erro ||
                "Erro ao excluir projeto."

            );

        }


        // ========================================
        // SUCESSO
        // ========================================

        mostrarMensagem(

            "Projeto removido com sucesso.",

            "sucesso"

        );


        // ========================================
        // ATUALIZAR LISTA
        // ========================================

        await carregarProjetos();


    } catch (erro) {

        console.error(
            "Erro ao excluir projeto:",
            erro
        );


        mostrarMensagem(

            erro.message ||
            "Erro ao excluir projeto.",

            "erro"

        );

    }

}


// ========================================
// MOSTRAR MENSAGEM
// ========================================

function mostrarMensagem(
    texto,
    tipo
) {

    if (!mensagem) {

        return;

    }


    mensagem.textContent =
        texto;


    mensagem.className =
        "mensagem";


    if (tipo) {

        mensagem.classList.add(
            tipo
        );

    }

}


// ========================================
// LOGOUT
// ========================================

if (logout) {

    logout.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();


            try {

                const resposta =
                    await fetch(

                        `${API_URL}/auth/logout`,

                        {

                            method:
                                "POST",

                            credentials:
                                "include"

                        }

                    );


                console.log(
                    "Logout:",
                    resposta.status
                );


            } catch (erro) {

                console.error(
                    "Erro ao fazer logout:",
                    erro
                );

            }


            // ========================================
            // VOLTAR PARA LOGIN
            // ========================================

            window.location.href =
                "login.html";

        }
    );

}


// ========================================
// ATUALIZAR PROJETOS
// ========================================

if (atualizarProjetos) {

    atualizarProjetos.addEventListener(

        "click",

        async () => {

            await carregarProjetos();

        }

    );

}


// ========================================
// INICIALIZAR PÁGINA
// ========================================

async function iniciarPagina() {

    console.log(
        "Iniciando página de projetos..."
    );


    // ========================================
    // VERIFICAR LOGIN
    // ========================================

    const autenticado =
        await carregarUsuario();


    if (!autenticado) {

        return;

    }


    // ========================================
    // BUSCAR PROJETOS
    // ========================================

    await carregarProjetos();

}


// ========================================
// EXECUTAR
// ========================================

iniciarPagina();