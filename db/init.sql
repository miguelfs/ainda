-- Schema: banco de questoes estilo UERJ para "Ainda Estou Aqui"

CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    number INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    part INTEGER NOT NULL CHECK (part BETWEEN 1 AND 3),
    line_start INTEGER NOT NULL,
    line_end INTEGER NOT NULL
);

CREATE TABLE subtopics (
    id SERIAL PRIMARY KEY,
    code VARCHAR(3) NOT NULL UNIQUE,  -- S1, S2, ..., S9
    name TEXT NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE chapter_subtopics (
    id SERIAL PRIMARY KEY,
    chapter_id INTEGER NOT NULL REFERENCES chapters(id),
    subtopic_id INTEGER NOT NULL REFERENCES subtopics(id),
    viable BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (chapter_id, subtopic_id)
);

CREATE TYPE question_status AS ENUM ('pending', 'draft', 'review', 'approved', 'rejected');
CREATE TYPE bloom_level AS ENUM ('understand', 'apply', 'analyze', 'evaluate');
CREATE TYPE correct_alt AS ENUM ('A', 'B', 'C', 'D');

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    chapter_subtopic_id INTEGER NOT NULL REFERENCES chapter_subtopics(id),
    question_number INTEGER NOT NULL CHECK (question_number BETWEEN 1 AND 3),

    -- Enunciado
    stem_quote TEXT NOT NULL,           -- citacao direta do trecho da obra
    stem_quote_page TEXT,               -- referencia de pagina: "(p. XX)"
    stem_quote_lines TEXT,              -- linhas do arquivo fonte: "3085-3088"
    stem_context TEXT NOT NULL,         -- frase(s) de contextualizacao
    stem_question TEXT NOT NULL,        -- a pergunta em si

    -- Alternativas
    alt_a TEXT NOT NULL,
    alt_b TEXT NOT NULL,
    alt_c TEXT NOT NULL,
    alt_d TEXT NOT NULL,
    correct_answer correct_alt NOT NULL,

    -- Explicacao
    explanation TEXT,              -- justificativa da alternativa correta e dos distratores

    -- Metadata
    bloom bloom_level NOT NULL,
    status question_status NOT NULL DEFAULT 'draft',
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (chapter_subtopic_id, question_number)
);

-- Index para consultas de progresso
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_cs ON questions(chapter_subtopic_id);

-- View: progresso por capitulo e subtopico
CREATE VIEW generation_progress AS
SELECT
    c.number AS chapter_number,
    c.title AS chapter_title,
    s.code AS subtopic_code,
    s.name AS subtopic_name,
    cs.viable,
    COUNT(q.id) FILTER (WHERE q.status != 'rejected') AS questions_done,
    3 - COUNT(q.id) FILTER (WHERE q.status != 'rejected') AS questions_remaining
FROM chapter_subtopics cs
JOIN chapters c ON c.id = cs.chapter_id
JOIN subtopics s ON s.id = cs.subtopic_id
LEFT JOIN questions q ON q.chapter_subtopic_id = cs.id
WHERE cs.viable = TRUE
GROUP BY c.number, c.title, s.code, s.name, cs.viable
ORDER BY c.number, s.code;

-- View: proxima questao a gerar (primeira combinacao com menos de 3 questoes)
CREATE VIEW next_to_generate AS
SELECT
    cs.id AS chapter_subtopic_id,
    c.number AS chapter_number,
    c.title AS chapter_title,
    c.line_start,
    c.line_end,
    s.code AS subtopic_code,
    s.name AS subtopic_name,
    COUNT(q.id) FILTER (WHERE q.status != 'rejected') AS done,
    (COUNT(q.id) FILTER (WHERE q.status != 'rejected') + 1) AS next_question_number
FROM chapter_subtopics cs
JOIN chapters c ON c.id = cs.chapter_id
JOIN subtopics s ON s.id = cs.subtopic_id
LEFT JOIN questions q ON q.chapter_subtopic_id = cs.id
WHERE cs.viable = TRUE
GROUP BY cs.id, c.number, c.title, c.line_start, c.line_end, s.code, s.name
HAVING COUNT(q.id) FILTER (WHERE q.status != 'rejected') < 3
ORDER BY c.number, s.code
LIMIT 1;

-- View: distribuicao de gabaritos
CREATE VIEW answer_distribution AS
SELECT
    correct_answer,
    COUNT(*) AS total,
    ROUND(100.0 * COUNT(*) / NULLIF(SUM(COUNT(*)) OVER (), 0), 1) AS pct
FROM questions
WHERE status != 'rejected'
GROUP BY correct_answer
ORDER BY correct_answer;

-- View: distribuicao de bloom
CREATE VIEW bloom_distribution AS
SELECT
    bloom,
    COUNT(*) AS total,
    ROUND(100.0 * COUNT(*) / NULLIF(SUM(COUNT(*)) OVER (), 0), 1) AS pct
FROM questions
WHERE status != 'rejected'
GROUP BY bloom
ORDER BY bloom;

-- View: resumo geral
CREATE VIEW generation_summary AS
SELECT
    COUNT(*) FILTER (WHERE status != 'rejected') AS total_questions,
    COUNT(*) FILTER (WHERE status = 'draft') AS drafts,
    COUNT(*) FILTER (WHERE status = 'review') AS in_review,
    COUNT(*) FILTER (WHERE status = 'approved') AS approved,
    COUNT(*) FILTER (WHERE status = 'rejected') AS rejected,
    501 - COUNT(*) FILTER (WHERE status != 'rejected') AS remaining
FROM questions;
