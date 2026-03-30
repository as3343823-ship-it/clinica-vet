-- =============================================================================
-- SCRIPT SQL COMPLETO - CLÍNICA VETERINÁRIA VET PATA-NODE
-- Funcionalidades: restrição peso/idade por espécie, validação de formatos,
--                  solicitação de exames pelo tutor, controlo de acesso
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. DATABASE
-- -----------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS clinica_vet
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE clinica_vet;

-- -----------------------------------------------------------------------------
-- 2. TABELA: dominios_email_permitidos
-- Define domínios de e-mail aceites no cadastro de tutores
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS dominios_email_permitidos;
CREATE TABLE dominios_email_permitidos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  dominio VARCHAR(100) NOT NULL UNIQUE,
  descricao VARCHAR(200) DEFAULT NULL,
  ativo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Domínios comuns aceites (Gmail, Outlook, Yahoo, Alt.mail, etc.)
INSERT INTO dominios_email_permitidos (dominio, descricao) VALUES
  ('gmail.com', 'Google Gmail'),
  ('googlemail.com', 'Google Mail alternativo'),
  ('outlook.com', 'Microsoft Outlook'),
  ('hotmail.com', 'Microsoft Hotmail'),
  ('live.com', 'Microsoft Live'),
  ('yahoo.com', 'Yahoo Mail'),
  ('yahoo.com.br', 'Yahoo Brasil'),
  ('icloud.com', 'Apple iCloud'),
  ('me.com', 'Apple Me'),
  ('protonmail.com', 'ProtonMail'),
  ('proton.me', 'Proton'),
  ('alt.mail', 'Alt.mail'),
  ('zoho.com', 'Zoho Mail'),
  ('uol.com.br', 'UOL'),
  ('bol.com.br', 'BOL'),
  ('terra.com.br', 'Terra'),
  ('ig.com.br', 'iG'),
  ('oi.com.br', 'Oi'),
  ('tim.com.br', 'TIM'),
  ('correios.com.br', 'Correios');

-- -----------------------------------------------------------------------------
-- 3. TABELA: especies_config
-- Restrições de peso (kg) e idade (anos) por espécie
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS especies_config;
CREATE TABLE especies_config (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  especie VARCHAR(80) NOT NULL UNIQUE,
  peso_min_kg DECIMAL(8,2) NOT NULL DEFAULT 0,
  peso_max_kg DECIMAL(8,2) NOT NULL,
  idade_min_anos INT UNSIGNED NOT NULL DEFAULT 0,
  idade_max_anos INT UNSIGNED NOT NULL,
  observacoes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Valores de referência por espécie (peso em kg, idade em anos)
INSERT INTO especies_config (especie, peso_min_kg, peso_max_kg, idade_min_anos, idade_max_anos, observacoes) VALUES
  ('Cachorro', 0.5, 90, 0, 25, 'Varia conforme raça'),
  ('Gato', 0.8, 15, 0, 25, NULL),
  ('Coelho', 0.5, 8, 0, 12, NULL),
  ('Hamster', 0.02, 0.2, 0, 4, NULL),
  ('Porquinho-da-índia', 0.5, 1.5, 0, 8, NULL),
  ('Chinchila', 0.4, 0.9, 0, 20, NULL),
  ('Furão (Ferret)', 0.5, 2.5, 0, 10, NULL),
  ('Cavalo', 100, 1000, 0, 35, NULL),
  ('Pônei', 90, 450, 0, 35, NULL),
  ('Cabra', 20, 120, 0, 18, NULL),
  ('Ovelha', 25, 180, 0, 15, NULL),
  ('Porco (Minipig)', 15, 80, 0, 20, NULL),
  ('Vaca', 200, 1200, 0, 25, NULL),
  ('Pássaro (Calopsita)', 0.06, 0.12, 0, 25, NULL),
  ('Pássaro (Papagaio)', 0.3, 0.5, 0, 80, NULL),
  ('Peixe (Beta)', 0.001, 0.01, 0, 5, NULL),
  ('Tartaruga (Tigre d''Água)', 0.1, 2, 0, 40, NULL),
  ('Iguana', 0.5, 6, 0, 20, NULL),
  ('Ouriço (Hedgehog)', 0.3, 0.6, 0, 7, NULL),
  ('Lhama', 120, 200, 0, 25, NULL),
  ('Alpaca', 48, 84, 0, 25, NULL);

-- -----------------------------------------------------------------------------
-- 4. TABELA: tutores
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS tutores;
CREATE TABLE tutores (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  telefone VARCHAR(30) DEFAULT NULL,
  genero VARCHAR(20) DEFAULT NULL,
  morada TEXT DEFAULT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  ativo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 5. TABELA: usuarios (funcionários)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  nivel ENUM('funcionario','administrador') NOT NULL DEFAULT 'funcionario',
  ativo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 6. TABELA: animais
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS animais;
CREATE TABLE animais (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(80) NOT NULL,
  idade INT UNSIGNED NOT NULL,
  especie VARCHAR(80) NOT NULL,
  sexo VARCHAR(20) NOT NULL,
  peso DECIMAL(8,2) NOT NULL,
  sintomas TEXT DEFAULT NULL,
  classif CHAR(1) NOT NULL DEFAULT 'A',
  tutor_id INT UNSIGNED NOT NULL,
  imagem_path VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tutor_id) REFERENCES tutores(id) ON DELETE CASCADE,
  INDEX idx_tutor (tutor_id),
  INDEX idx_especie (especie),
  INDEX idx_classif (classif)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 7. TABELA: exames_tipos
-- Tipos de exame disponíveis para solicitação
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS exames_tipos;
CREATE TABLE exames_tipos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  descricao VARCHAR(120) NOT NULL,
  ativo TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

INSERT INTO exames_tipos (codigo, descricao) VALUES
  ('hemograma', 'Hemograma completo'),
  ('urina', 'Urina tipo 1'),
  ('parasitologico', 'Parasitológico de fezes'),
  ('bioquimico', 'Bioquímico sérico'),
  ('raio_x', 'Raio-X'),
  ('ultrassom', 'Ultrassom'),
  ('ecg', 'Eletrocardiograma');

-- -----------------------------------------------------------------------------
-- 8. TABELA: solicitacoes_exames
-- Tutor solicita exame; funcionário agenda/confirma
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS solicitacoes_exames;
CREATE TABLE solicitacoes_exames (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  animal_id INT UNSIGNED NOT NULL,
  tutor_id INT UNSIGNED NOT NULL,
  tipo_exame_id INT UNSIGNED DEFAULT NULL,
  tipo_exame_texto VARCHAR(100) DEFAULT NULL,
  observacao TEXT DEFAULT NULL,
  status ENUM('pendente','aprovada','agendada','realizada','recusada') NOT NULL DEFAULT 'pendente',
  data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_agendamento DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (animal_id) REFERENCES animais(id) ON DELETE CASCADE,
  FOREIGN KEY (tutor_id) REFERENCES tutores(id) ON DELETE CASCADE,
  FOREIGN KEY (tipo_exame_id) REFERENCES exames_tipos(id) ON DELETE SET NULL,
  INDEX idx_tutor_status (tutor_id, status)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 9. TABELA: exames
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS exames;
CREATE TABLE exames (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tipo VARCHAR(80) NOT NULL,
  resultados TEXT DEFAULT NULL,
  data DATE NOT NULL,
  realizado TINYINT(1) DEFAULT 0,
  animal_id INT UNSIGNED NOT NULL,
  solicitacao_id INT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (animal_id) REFERENCES animais(id) ON DELETE CASCADE,
  FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_exames(id) ON DELETE SET NULL,
  INDEX idx_animal (animal_id),
  INDEX idx_data (data)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 10. TABELA: tratamentos
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS tratamentos;
CREATE TABLE tratamentos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tipo VARCHAR(80) NOT NULL,
  descricao TEXT DEFAULT NULL,
  data DATE NOT NULL,
  realizado TINYINT(1) DEFAULT 0,
  animal_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (animal_id) REFERENCES animais(id) ON DELETE CASCADE,
  INDEX idx_animal (animal_id),
  INDEX idx_data (data)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 11. TABELA: permissoes (controlo de acesso)
-- Define o que cada tipo de utilizador pode fazer
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS permissoes;
CREATE TABLE permissoes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tipo_usuario ENUM('tutor','funcionario','administrador') NOT NULL,
  recurso VARCHAR(50) NOT NULL,
  acao ENUM('ver','criar','editar','remover','solicitar') NOT NULL,
  permitido TINYINT(1) DEFAULT 1,
  UNIQUE KEY uk_tipo_recurso_acao (tipo_usuario, recurso, acao)
) ENGINE=InnoDB;

-- Tutor: ver animais próprios, solicitar exames, ver agenda
-- Funcionário: gestão completa
-- Administrador: tudo + gestão de usuários
INSERT INTO permissoes (tipo_usuario, recurso, acao, permitido) VALUES
  ('tutor', 'animais', 'ver', 1),
  ('tutor', 'animais', 'criar', 1),
  ('tutor', 'animais', 'editar', 0),
  ('tutor', 'animais', 'remover', 0),
  ('tutor', 'exames', 'ver', 1),
  ('tutor', 'exames', 'solicitar', 1),
  ('tutor', 'exames', 'criar', 0),
  ('tutor', 'agenda', 'ver', 1),
  ('tutor', 'tratamentos', 'ver', 1),
  ('tutor', 'tratamentos', 'criar', 0),
  ('funcionario', 'animais', 'ver', 1),
  ('funcionario', 'animais', 'criar', 1),
  ('funcionario', 'animais', 'editar', 1),
  ('funcionario', 'animais', 'remover', 1),
  ('funcionario', 'exames', 'ver', 1),
  ('funcionario', 'exames', 'criar', 1),
  ('funcionario', 'exames', 'solicitar', 0),
  ('funcionario', 'agenda', 'ver', 1),
  ('funcionario', 'tratamentos', 'ver', 1),
  ('funcionario', 'tratamentos', 'criar', 1),
  ('administrador', 'usuarios', 'ver', 1),
  ('administrador', 'usuarios', 'criar', 1),
  ('administrador', 'usuarios', 'editar', 1);

-- -----------------------------------------------------------------------------
-- 12. USUÁRIO ADMIN INICIAL (opcional - executar após gerar hash)
-- Senha sugerida: admin123
-- Em Node: require('bcryptjs').hashSync('admin123', 10)
-- -----------------------------------------------------------------------------
-- INSERT INTO usuarios (username, senha_hash, nivel) VALUES
--   ('admin', '<hash_bcrypt_aqui>', 'administrador');

-- -----------------------------------------------------------------------------
-- 13. VIEWS para simplificar consultas
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_animais_com_validacao AS
SELECT a.*, t.nome AS tutor_nome, t.email AS tutor_email,
       ec.peso_min_kg, ec.peso_max_kg, ec.idade_min_anos, ec.idade_max_anos,
       (a.peso BETWEEN ec.peso_min_kg AND ec.peso_max_kg) AS peso_valido,
       (a.idade BETWEEN ec.idade_min_anos AND ec.idade_max_anos) AS idade_valida
FROM animais a
JOIN tutores t ON t.id = a.tutor_id
LEFT JOIN especies_config ec ON ec.especie = a.especie;

SET FOREIGN_KEY_CHECKS = 1;
