const loginForm = document.getElementById("loginForm");
const mensagem = document.getElementById("mensagem");

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const senha =
        document.getElementById("senha").value;

    mensagem.textContent = "Entrando...";

    try {

        const resposta = await fetch(
            `${API_URL}/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    email,
                    senha
                })
            }
        );

        const dados = await resposta.json();

        console.log(
            "Resposta do servidor:",
            dados
        );

        if (!resposta.ok) {

            mensagem.textContent =
                dados.erro ||
                "Erro ao fazer login.";

            return;
        }

        mensagem.textContent =
            "Login realizado com sucesso!";

        setTimeout(() => {

            window.location.href =
                "dashboard.html";

        }, 1000);

    } catch (erro) {

        console.error(
            "Erro de conexão:",
            erro
        );

        mensagem.textContent =
            "Erro ao conectar com o servidor.";

    }

});