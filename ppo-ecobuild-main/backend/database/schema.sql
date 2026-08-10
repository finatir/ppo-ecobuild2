PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    nome TEXT NOT NULL,

    email TEXT NOT NULL UNIQUE,

    senha TEXT NOT NULL

);

CREATE TABLE IF NOT EXISTS tijolos (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    tipo TEXT NOT NULL,

    comprimento REAL NOT NULL,

    largura REAL NOT NULL,

    altura REAL NOT NULL

);

CREATE TABLE IF NOT EXISTS projetos (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    usuario_id INTEGER NOT NULL,

    tijolo_id INTEGER NOT NULL,

    nome_projeto TEXT NOT NULL,

    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,

    area_parede REAL NOT NULL,

    espessura_junta REAL NOT NULL,

    FOREIGN KEY(usuario_id)
        REFERENCES usuarios(id),

    FOREIGN KEY(tijolo_id)
        REFERENCES tijolos(id)

);

CREATE TABLE IF NOT EXISTS modelos_pre_definidos (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    nome TEXT NOT NULL,

    descricao TEXT

);

CREATE TABLE IF NOT EXISTS calculos (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    projeto_id INTEGER NOT NULL,

    modelo_id INTEGER,

    qtd_tijolos INTEGER NOT NULL,

    volume_argamassa REAL NOT NULL,

    area_total REAL NOT NULL,

    data_calculo DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(projeto_id)
        REFERENCES projetos(id),

    FOREIGN KEY(modelo_id)
        REFERENCES modelos_pre_definidos(id)

);

CREATE TABLE IF NOT EXISTS medidas_customizadas (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    calculo_id INTEGER NOT NULL,

    descricao TEXT NOT NULL,

    valor REAL NOT NULL,

    FOREIGN KEY(calculo_id)
        REFERENCES calculos(id)

);

INSERT OR IGNORE INTO tijolos (
    id,
    tipo,
    comprimento,
    largura,
    altura
)
VALUES
(
    1,
    'Tijolo 9 Furos',
    19,
    9,
    14
);

INSERT OR IGNORE INTO tijolos (
    id,
    tipo,
    comprimento,
    largura,
    altura
)
VALUES
(
    2,
    'Bloco de Concreto',
    29,
    14,
    19
);

INSERT OR IGNORE INTO modelos_pre_definidos (
    id,
    nome,
    descricao
)
VALUES
(
    1,
    'Residencial',
    'Construções residenciais'
);

INSERT OR IGNORE INTO modelos_pre_definidos (
    id,
    nome,
    descricao
)
VALUES
(
    2,
    'Comercial',
    'Construções comerciais'
);