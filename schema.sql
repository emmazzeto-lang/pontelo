CREATE EXTENSION IF NOT EXISTS postgis;


-- ENUMs
CREATE TYPE papel_usuario    AS ENUM ('colaborador', 'organizacao', 'moderador');
CREATE TYPE status_servico   AS ENUM ('pendente', 'publicado', 'rejeitado', 'arquivado');
CREATE TYPE tipo_verificacao AS ENUM ('confirmacao', 'moderacao');
CREATE TYPE status_denuncia  AS ENUM ('aberta', 'em_analise', 'resolvida', 'descartada');


-- usuarios
CREATE TABLE usuarios (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        TEXT           NOT NULL,
    email       TEXT           NOT NULL,
    senha_hash  TEXT           NOT NULL,
    papel       papel_usuario  NOT NULL DEFAULT 'colaborador',
    criado_em   TIMESTAMPTZ    NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uq_usuarios_email ON usuarios (lower(email));


-- organizacoes
CREATE TABLE organizacoes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome            TEXT        NOT NULL,
    cnpj            VARCHAR(18) UNIQUE,  -- opcional
    responsavel_id  UUID        NOT NULL REFERENCES usuarios (id),
    verificada      BOOLEAN     NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_organizacoes_responsavel ON organizacoes (responsavel_id);


-- categorias
CREATE TABLE categorias (
    id     SERIAL PRIMARY KEY,
    slug   VARCHAR(60)  NOT NULL UNIQUE,
    nome   VARCHAR(100) NOT NULL,
    icone  VARCHAR(60),
    cor    VARCHAR(20)
);


-- servicos
CREATE TABLE servicos (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome                   TEXT            NOT NULL,
    descricao              TEXT,
    categoria_id           INT             NOT NULL REFERENCES categorias (id),
    organizacao_id         UUID            REFERENCES organizacoes (id) ON DELETE SET NULL,
    endereco               TEXT            NOT NULL,
    -- Abrigos para vítimas de violência: a API pública esconde endereço, CEP e coordenadas
    endereco_restrito      BOOLEAN         NOT NULL DEFAULT FALSE,
    cidade                 TEXT            NOT NULL,
    uf                     CHAR(2)         NOT NULL,
    cep                    CHAR(8),
    localizacao            GEOGRAPHY(Point, 4326) NOT NULL,
    telefone               TEXT,
    documentos_exigidos    TEXT,
    status                 status_servico  NOT NULL DEFAULT 'pendente',
    ultima_verificacao_em  TIMESTAMPTZ,
    criado_por             UUID            NOT NULL REFERENCES usuarios (id),
    criado_em              TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT ck_servicos_uf  CHECK (uf = upper(uf)),
    CONSTRAINT ck_servicos_cep CHECK (cep IS NULL OR cep ~ '^[0-9]{8}$')
);
CREATE INDEX idx_servicos_localizacao  ON servicos USING GIST (localizacao);
CREATE INDEX idx_servicos_status       ON servicos (status);
CREATE INDEX idx_servicos_categoria    ON servicos (categoria_id);
CREATE INDEX idx_servicos_organizacao  ON servicos (organizacao_id);
CREATE INDEX idx_servicos_criado_por   ON servicos (criado_por);
CREATE INDEX idx_servicos_cidade_uf    ON servicos (uf, cidade);
CREATE INDEX idx_servicos_ultima_verif ON servicos (ultima_verificacao_em);


-- horarios_funcionamento
CREATE TABLE horarios_funcionamento (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    servico_id  UUID     NOT NULL REFERENCES servicos (id) ON DELETE CASCADE,
    dia_semana  SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),  -- 0 = domingo
    abre        TIME     NOT NULL,
    fecha       TIME     NOT NULL,
    CONSTRAINT ck_horario_valido CHECK (abre <> fecha)
);
CREATE INDEX idx_horarios_servico ON horarios_funcionamento (servico_id, dia_semana);


-- verificacoes
CREATE TABLE verificacoes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    servico_id  UUID             NOT NULL REFERENCES servicos (id) ON DELETE CASCADE,
    usuario_id  UUID             NOT NULL REFERENCES usuarios (id),
    tipo        tipo_verificacao NOT NULL,
    resultado   VARCHAR(30)      NOT NULL,
    comentario  TEXT,
    criado_em   TIMESTAMPTZ      NOT NULL DEFAULT now()
);
CREATE INDEX idx_verificacoes_servico ON verificacoes (servico_id, criado_em DESC);
CREATE INDEX idx_verificacoes_usuario ON verificacoes (usuario_id);


-- denuncias
CREATE TABLE denuncias (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    servico_id     UUID            NOT NULL REFERENCES servicos (id) ON DELETE CASCADE,
    usuario_id     UUID            REFERENCES usuarios (id) ON DELETE SET NULL,
    motivo         VARCHAR(100)    NOT NULL,
    descricao      TEXT,
    status         status_denuncia NOT NULL DEFAULT 'aberta',
    resolvido_por  UUID            REFERENCES usuarios (id),
    criado_em      TIMESTAMPTZ     NOT NULL DEFAULT now()
);
CREATE INDEX idx_denuncias_servico ON denuncias (servico_id);
CREATE INDEX idx_denuncias_status  ON denuncias (status);


-- chaves_api
CREATE TABLE chaves_api (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id     UUID         NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    nome           VARCHAR(100) NOT NULL,
    hash_da_chave  TEXT         NOT NULL UNIQUE,
    ativa          BOOLEAN      NOT NULL DEFAULT TRUE,
    ultimo_uso     TIMESTAMPTZ,
    criado_em      TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_chaves_api_usuario ON chaves_api (usuario_id);


-- refresh_tokens
CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id  UUID        NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    token_hash  TEXT        NOT NULL UNIQUE,
    expira_em   TIMESTAMPTZ NOT NULL,
    revogado    BOOLEAN     NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_refresh_tokens_usuario ON refresh_tokens (usuario_id);


-- Regras de negócio
CREATE OR REPLACE FUNCTION selo_confianca(
    ultima_verificacao TIMESTAMPTZ,
    prazo_dias INT DEFAULT 90
) RETURNS TEXT
LANGUAGE sql STABLE AS $$
    SELECT CASE
        WHEN ultima_verificacao IS NOT NULL
             AND ultima_verificacao >= now() - make_interval(days => prazo_dias)
        THEN 'verificado'
        ELSE 'a_confirmar'
    END;
$$;


-- Atualiza servicos.ultima_verificacao_em quando uma confirmação é registrada
CREATE OR REPLACE FUNCTION fn_atualiza_ultima_verificacao()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.tipo = 'confirmacao' AND NEW.resultado = 'confirmado' THEN
        UPDATE servicos
           SET ultima_verificacao_em = NEW.criado_em
         WHERE id = NEW.servico_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_verificacoes_atualiza_servico
AFTER INSERT ON verificacoes
FOR EACH ROW EXECUTE FUNCTION fn_atualiza_ultima_verificacao();


-- View pública: somente serviços publicados, com selo e coordenadas
CREATE OR REPLACE VIEW vw_servicos_publicos AS
SELECT
    s.id,
    s.nome,
    s.descricao,
    c.slug  AS categoria_slug,
    c.nome  AS categoria_nome,
    c.icone,
    c.cor,
    -- Endereço restrito: só a cidade e a UF continuam visíveis
    CASE WHEN s.endereco_restrito THEN NULL ELSE s.endereco END AS endereco,
    s.endereco_restrito,
    s.cidade,
    s.uf,
    CASE WHEN s.endereco_restrito THEN NULL ELSE s.cep END AS cep,
    CASE WHEN s.endereco_restrito THEN NULL ELSE ST_Y(s.localizacao::geometry) END AS latitude,
    CASE WHEN s.endereco_restrito THEN NULL ELSE ST_X(s.localizacao::geometry) END AS longitude,
    s.telefone,
    s.documentos_exigidos,
    s.ultima_verificacao_em,
    selo_confianca(s.ultima_verificacao_em) AS selo
FROM servicos s
JOIN categorias c ON c.id = s.categoria_id
WHERE s.status = 'publicado';


-- Dados iniciais (categorias)
INSERT INTO categorias (slug, nome, icone, cor) VALUES
    ('abrigo',      'Abrigo',       'home',        '#E67E22'),
    ('refeitorio',  'Refeitório',   'utensils',    '#27AE60'),
    ('juridico',    'Jurídico',     'scale',       '#2980B9'),
    ('saude',       'Saúde',        'heart-pulse', '#C0392B'),
    ('cras',        'CRAS',         'users',       '#8E44AD'),
    ('documentos',  'Documentos',   'file-text',   '#16A085')
ON CONFLICT (slug) DO NOTHING;

-- Modo discreto: e-mails que aceitaram ser contato de confiança.
-- Guarda só o hash (HMAC) do e-mail: o banco não sabe quem são os contatos nem quem os cadastrou.
-- Os contatos ficam no celular de quem pede ajuda; aqui só fica o "sim, aceito receber alertas".
CREATE TABLE IF NOT EXISTS contatos_alerta (
    email_hash     TEXT        PRIMARY KEY,
    confirmado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);
