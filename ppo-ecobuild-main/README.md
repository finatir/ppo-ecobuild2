# EcoBuild — versão corrigida

## O que foi corrigido
- CSS unificado: todas as páginas usam `frontend/css/style.css` e seguem o visual da página principal.
- Login e cadastro agora usam a API pela mesma origem (`API_URL = ""`), sem URL `localhost` ou URL fixa de Codespaces no JavaScript.
- Backend passa a servir o frontend e a API na mesma aplicação.
- Banco SQLite é inicializado automaticamente pelo `backend/database.js`.
- Login usa sessão e senha com hash bcrypt.
- Calculadora foi reconstruída: o arquivo `calculadora.html` estava contendo JavaScript em vez de HTML.
- Calculadora calcula tijolos, argamassa estimada e salva o resultado no banco.
- Projeto carregado na calculadora preenche automaticamente suas medidas.
- Histórico de cálculos funciona por projeto.
- Exclusão de projetos foi protegida para afetar somente o usuário logado e também remove os cálculos vinculados.
- Rotas de projeto agora retornam as dimensões do tijolo corretamente.
- Adicionada página de ajuda com o mesmo layout.

## Como executar

1. Abra um terminal na pasta `backend`.
2. Execute:
   `npm install`
3. Execute:
   `npm start`
4. Acesse o endereço/porta disponibilizado pelo servidor. Em ambiente local, normalmente será a porta 3000; em Codespaces/servidores online, use o endereço público fornecido pela plataforma.

O navegador não possui mais `localhost` ou domínio de Codespaces gravado no código. A API usa a mesma origem da página.

## Banco
O banco é SQLite e fica em `backend/database/ecobuild.db`. O arquivo é criado automaticamente na primeira inicialização.

## Produção
Defina uma variável `SESSION_SECRET` forte no servidor. Se usar HTTPS, defina `NODE_ENV=production`.
