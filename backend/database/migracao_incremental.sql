-- =============================================================================
-- MIGRAÇÃO INCREMENTAL - Clínica Vet Pata-Node
-- Execute apenas se já possui a base de dados em funcionamento
-- Adiciona: especies_config, dominios_email_permitidos, solicitacoes_exames,
--           exames_tipos, permissoes, e coluna solicitacao_id em exames
-- =============================================================================

USE clinica_vet;

-- 1. dominios_email_permitidos
CREATE TABLE IF NOT EXISTS dominios_email_permitidos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  dominio VARCHAR(100) NOT NULL UNIQUE,
  descricao VARCHAR(200) DEFAULT NULL,
  ativo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT IGNORE INTO dominios_email_permitidos (dominio, descricao) VALUES
  ('gmail.com', 'Google Gmail'),
  ('googlemail.com', 'Google Mail alternativo'),
  ('outlook.com', 'Microsoft Outlook'),
  ('hotmail.com', 'Microsoft Hotmail'),
  ('live.com', 'Microsoft Live'),
  ('yahoo.com', 'Yahoo Mail'),
  ('icloud.com', 'Apple iCloud'),
  ('protonmail.com', 'ProtonMail'),
  ('alt.mail', 'Alt.mail'),
  ('uol.com.br', 'UOL'),
  ('bol.com.br', 'BOL');

-- 2. especies_config
CREATE TABLE IF NOT EXISTS especies_config (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  especie VARCHAR(80) NOT NULL UNIQUE,
  peso_min_kg DECIMAL(8,2) NOT NULL DEFAULT 0,
  peso_max_kg DECIMAL(8,2) NOT NULL,
  idade_min_anos INT UNSIGNED NOT NULL DEFAULT 0,
  idade_max_anos INT UNSIGNED NOT NULL,
  observacoes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT IGNORE INTO especies_config (especie, peso_min_kg, peso_max_kg, idade_min_anos, idade_max_anos) VALUES
  ('Cachorro', 0.5, 90, 0, 25),
  ('Gato', 0.8, 15, 0, 25),
  ('Coelho', 0.5, 8, 0, 12),
  ('Hamster', 0.02, 0.2, 0, 4),
  ('Cavalo', 100, 1000, 0, 35);

-- 3. exames_tipos
CREATE TABLE IF NOT EXISTS exames_tipos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  descricao VARCHAR(120) NOT NULL,
  ativo TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

INSERT IGNORE INTO exames_tipos (codigo, descricao) VALUES
  ('hemograma', 'Hemograma completo'),
  ('urina', 'Urina tipo 1'),
  ('parasitologico', 'Parasitológico'),
  ('raio_x', 'Raio-X');

-- 4. solicitacoes_exames
CREATE TABLE IF NOT EXISTS solicitacoes_exames (
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
  INDEX idx_tutor_status (tutor_id, status)
) ENGINE=InnoDB;

-- 5. Coluna solicitacao_id em exames (executar apenas se a coluna ainda não existir)
-- ALTER TABLE exames ADD COLUMN solicitacao_id INT UNSIGNED DEFAULT NULL AFTER animal_id;

-- 6. permissoes
CREATE TABLE IF NOT EXISTS permissoes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tipo_usuario ENUM('tutor','funcionario','administrador') NOT NULL,
  recurso VARCHAR(50) NOT NULL,
  acao ENUM('ver','criar','editar','remover','solicitar') NOT NULL,
  permitido TINYINT(1) DEFAULT 1,
  UNIQUE KEY uk_tipo_recurso_acao (tipo_usuario, recurso, acao)
) ENGINE=InnoDB;

INSERT IGNORE INTO permissoes (tipo_usuario, recurso, acao, permitido) VALUES
  ('tutor', 'animais', 'ver', 1),
  ('tutor', 'exames', 'solicitar', 1),
  ('funcionario', 'animais', 'ver', 1),
  ('funcionario', 'animais', 'criar', 1),
  ('funcionario', 'exames', 'criar', 1);
