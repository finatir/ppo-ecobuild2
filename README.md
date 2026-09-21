# EcoBuild

Sistema de cálculo de materiais para projetos de construção.

## Banco de dados

O EcoBuild usa **PostgreSQL**. O SQLite foi removido do projeto para que o banco possa ser hospedado pelo Render.

As tabelas são criadas automaticamente na inicialização pela estrutura em `backend/database/schema.sql`.

## Rodar localmente

Você precisa ter um PostgreSQL disponível e definir `DATABASE_URL`.

Exemplo:

```text
DATABASE_URL=postgresql://postgres:senha@localhost:5432/ecobuild
```

No terminal, defina a variável e depois execute:

### Linux / macOS

```bash
export DATABASE_URL="postgresql://postgres:senha@localhost:5432/ecobuild"
export SESSION_SECRET="uma-chave-de-desenvolvimento"
cd backend
npm install
npm start
```

### PowerShell

```powershell
$env:DATABASE_URL="postgresql://postgres:senha@localhost:5432/ecobuild"
$env:SESSION_SECRET="uma-chave-de-desenvolvimento"
cd backend
npm install
npm start
```

Depois abra:

```text
http://localhost:3000
```

## Live Server

O `frontend/js/api.js` detecta o Live Server e direciona as chamadas para o backend na porta 3000.

## Publicar no Render gratuitamente

O projeto possui `render.yaml` com um Web Service e um Render Postgres no plano Free.

No Render:

1. Conecte o repositório do GitHub.
2. Crie um Blueprint usando o `render.yaml` da raiz.
3. Confirme o plano `free` para o Web Service e o Postgres.
4. Faça o deploy.

O Blueprint cria o banco e injeta automaticamente a variável `DATABASE_URL` no Web Service.

### Limitações do Free do Render

Segundo a documentação atual do Render, Web Services Free não têm disco persistente e podem entrar em suspensão após 15 minutos sem tráfego. O Render Postgres Free tem 1 GB de armazenamento, é limitado a uma instância Free por workspace e **expira 30 dias após a criação**, com período de carência de 14 dias para upgrade antes da exclusão.

Por isso, esta configuração é adequada para demonstração, testes e apresentação do projeto, mas não deve ser tratada como armazenamento permanente.

## Estrutura

- `frontend/`: páginas, CSS e JavaScript do navegador.
- `backend/`: Express, autenticação, rotas e PostgreSQL.
- `backend/database/schema.sql`: criação das tabelas e dados iniciais.
- `render.yaml`: deploy do Web Service + Postgres.
