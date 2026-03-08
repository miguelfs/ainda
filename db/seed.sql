-- Seed: capitulos e subtopicos

INSERT INTO chapters (number, title, part, line_start, line_end) VALUES
(1,  'Onde e aqui?',                              1, 193,  681),
(2,  'A agua que nao era mais do mar',             1, 682,  1016),
(3,  'Bla-bla-bla...',                             1, 1017, 1486),
(4,  'Cometas da memoria',                         1, 1487, 1876),
(5,  'Mae-protocolo',                              1, 1877, 2283),
(6,  'Merda de ditadura',                          2, 2284, 2754),
(7,  'E a peste, Augustin',                        2, 2755, 3023),
(8,  'O telefone tocou',                           2, 3024, 3424),
(9,  'Doze dias',                                  2, 3425, 4015),
(10, 'Ou, ou, ou, ou, ou...',                      2, 4016, 4391),
(11, 'O sacrificio',                               2, 4392, 4777),
(12, 'Depois do luto',                             3, 4778, 5119),
(13, 'Voce se lembra de mim?',                     3, 5120, 5333),
(14, 'Ja falei do sufle?',                         3, 5334, 5821),
(15, 'O choro final',                              3, 5822, 6079),
(16, 'O alemao impronunciavel',                    3, 6080, 6806),
(17, 'O que estou fazendo aqui?',                  3, 6807, 7262),
(18, 'A denuncia',                                 3, 7263, 7885),
(19, 'Decisao - Recebimento da denuncia',          3, 7886, 8200);

INSERT INTO subtopics (code, name, description) VALUES
('S1', 'Interpretacao de tema',         'Identificar e caracterizar temas centrais do trecho ou capitulo'),
('S2', 'Analise de personagem',         'Inferir perfil, motivacoes, transformacoes e contradicoes dos personagens'),
('S3', 'Figuras de linguagem',          'Identificar e analisar o efeito de sentido de figuras retoricas'),
('S4', 'Recursos narrativos',           'Analisar escolhas de narrador, tempo narrativo, metaficcao, metalinguagem'),
('S5', 'Analise linguistica em contexto','Valor semantico de palavras, expressoes, conectivos e pontuacao no contexto'),
('S6', 'Contexto historico e social',   'Relacionar o trecho ao periodo historico ou a questoes sociais'),
('S7', 'Argumentacao e leitura critica','Analisar estrategias argumentativas, posicionamentos criticos, tom e registro'),
('S8', 'Intertextualidade',            'Relacionar trechos com textos externos, referencias culturais, outras obras'),
('S9', 'Forma e estrutura',            'Analisar como a organizacao formal contribui para o sentido');

-- Gerar todas as combinacoes capitulo x subtopico
INSERT INTO chapter_subtopics (chapter_id, subtopic_id, viable)
SELECT c.id, s.id,
    CASE
        WHEN c.number IN (18, 19) AND s.code IN ('S2', 'S3') THEN FALSE
        ELSE TRUE
    END
FROM chapters c
CROSS JOIN subtopics s;
