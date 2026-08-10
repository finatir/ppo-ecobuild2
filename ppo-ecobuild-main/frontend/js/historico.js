const API = "http://localhost:3000";

async function carregarHistorico(){

    const resposta = await fetch(`${API}/calculos`,{

        credentials:"include"

    });

    const historico = await resposta.json();

    const tabela = document.getElementById("historico");

    tabela.innerHTML = "";

    historico.forEach(item=>{

        tabela.innerHTML += `

        <tr>

            <td>${item.nome_projeto}</td>

            <td>${item.qtd_tijolos}</td>

            <td>${item.volume_argamassa}</td>

            <td>${item.data_calculo}</td>

        </tr>

        `;

    });

}

carregarHistorico();