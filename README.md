# EcoBuild

Sistema de cálculo de materiais para projetos de construção.

## Rodar localmente

1. Entre em `backend/`.
2. Execute `npm install`.
3. Execute `npm start`.
4. Abra `http://localhost:3000`.

O banco local fica em `backend/database/ecobuild.db`.

## Usar Live Server

Também é possível abrir `frontend/index.html` pelo Live Server (normalmente em `127.0.0.1:5500`). O `frontend/js/api.js` direciona as chamadas para `localhost:3000` automaticamente.

## Publicar online com Render

O projeto já possui `render.yaml` para um único Web Service. O Express serve o frontend e a API no mesmo endereço, então em produção o navegador usa URLs relativas e não precisa conhecer `localhost`.

No Render, conecte este repositório como um Blueprint. O serviço usa:

- Build: `npm --prefix backend install`
- Start: `node backend/server.js`
- Health check: `/health`
- Banco: `/var/data/ecobuild.db`
- Variável `SESSION_SECRET` gerada pelo Render

### Atenção ao SQLite

O `render.yaml` inclui um Persistent Disk de 1 GB para manter os dados do SQLite entre deploys e reinicializações. No Render, Persistent Disks estão disponíveis para serviços web pagos; sem armazenamento persistente, o filesystem do serviço é efêmero e os dados locais podem ser perdidos em novos deploys/restarts.

## Estrutura

- `frontend/`: páginas, CSS e JavaScript do navegador.
- `backend/`: Express, autenticação, rotas e SQLite.
- `render.yaml`: configuração de deploy online.
