(function configurarAPI() {
    const { protocol, hostname, port } = window.location;
    let apiUrl = "";

    // Live Server local: frontend em 5500 -> backend em 3000.
    const localHost = hostname === "localhost" || hostname === "127.0.0.1";
    if (localHost && port !== "3000") {
        apiUrl = `${protocol}//${hostname}:3000`;
    }

    // GitHub Codespaces / app.github.dev: troca a porta pública do frontend pela 3000.
    if (hostname.endsWith(".app.github.dev") && port && port !== "3000") {
        const apiHostname = hostname.replace(/-\d+(?=\.app\.github\.dev$)/, "-3000");
        apiUrl = `${protocol}//${apiHostname}`;
    }

    // Produção: vazio = mesma origem (ex.: https://ecobuild.onrender.com).
    window.API_URL = apiUrl;
})();
