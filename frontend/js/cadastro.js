const cadastroForm = document.getElementById("cadastroForm");
const mensagem = document.getElementById("mensagem");

cadastroForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    mensagem.textContent = "Criando conta...";

    try {

        const resposta = await fetch(
            `${API_URL}/auth/cadastro`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    nome,
                    email,
                    senha
                })
            }
        );

        const dados = await resposta.json();

        console.log("Resposta do servidor:", dados);

        if (!resposta.ok) {

            mensagem.textContent =
                dados.erro ||
                "Erro ao criar conta.";

            return;
        }

        mensagem.textContent =
            "Conta criada com sucesso!";

        cadastroForm.reset();

        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 1500);

    } catch (erro) {

        console.error(
            "Erro de conexão:",
            erro
        );

        mensagem.textContent =
            "Erro ao conectar com o servidor.";

    }

});