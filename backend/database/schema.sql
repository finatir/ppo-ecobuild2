CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tijolos (
    id SERIAL PRIMARY KEY,
    tipo TEXT NOT NULL,
    comprimento DOUBLE PRECISION NOT NULL,
    largura DOUBLE PRECISION NOT NULL,
    altura DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS projetos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    tijolo_id INTEGER NOT NULL REFERENCES tijolos(id),
    nome_projeto TEXT NOT NULL,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    area_parede DOUBLE PRECISION NOT NULL,
    espessura_junta DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS modelos_pre_definidos (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT
);

CREATE TABLE IF NOT EXISTS calculos (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL REFERENCES projetos(id),
    modelo_id INTEGER REFERENCES modelos_pre_definidos(id),
    qtd_tijolos INTEGER NOT NULL,
    volume_argamassa DOUBLE PRECISION NOT NULL,
    area_total DOUBLE PRECISION NOT NULL,
    data_calculo TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medidas_customizadas (
    id SERIAL PRIMARY KEY,
    calculo_id INTEGER NOT NULL REFERENCES calculos(id),
    descricao TEXT NOT NULL,
    valor DOUBLE PRECISION NOT NULL
);

INSERT INTO tijolos (id, tipo, comprimento, largura, altura)
VALUES
    (1, 'Tijolo 9 Furos', 19, 9, 14),
    (2, 'Bloco de Concreto', 29, 14, 19)
ON CONFLICT (id) DO NOTHING;

INSERT INTO modelos_pre_definidos (id, nome, descricao)
VALUES
    (1, 'Residencial', 'Construções residenciais'),
    (2, 'Comercial', 'Construções comerciais')
ON CONFLICT (id) DO NOTHING;

-- Mantém a sequência SERIAL alinhada após a carga dos registros iniciais.
SELECT setval(
    pg_get_serial_sequence('tijolos', 'id'),
    GREATEST((SELECT COALESCE(MAX(id), 1) FROM tijolos), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('modelos_pre_definidos', 'id'),
    GREATEST((SELECT COALESCE(MAX(id), 1) FROM modelos_pre_definidos), 1),
    true
);
