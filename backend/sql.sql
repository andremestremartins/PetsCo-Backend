
CREATE DATABASE IF NOT EXISTS petsco CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; 
USE petsco;

CREATE TABLE utilizadores (
    util_id INT AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    morada VARCHAR(255),
    codigo_postal VARCHAR(20),
    cidade VARCHAR(100),
    data_registo DATETIME DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(50) DEFAULT 'cliente',
    ativo BOOL DEFAULT true,
    CONSTRAINT pk_utilizadores PRIMARY KEY (util_id)
) ENGINE=InnoDB;

CREATE TABLE animais (
    animal_id INT AUTO_INCREMENT,
    util_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    fotografia VARCHAR(255),
    especie VARCHAR(50) NOT NULL,
    raca VARCHAR(50),
    data_nascimento DATE,
    sexo ENUM('M', 'F'),
    peso DECIMAL(5,2),
    informacoes VARCHAR(500),
    CONSTRAINT pk_animais PRIMARY KEY (animal_id),
    CONSTRAINT fk_animais_utilizadores FOREIGN KEY (util_id) 
        REFERENCES utilizadores(util_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE categorias_servico (
    cat_service_id INT AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(500),
    CONSTRAINT pk_categorias_servico PRIMARY KEY (cat_service_id)
) ENGINE=InnoDB;

CREATE TABLE servicos (
    service_id INT AUTO_INCREMENT,
    cat_service_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    duracao INT,
    fotografia VARCHAR(255),
    ativo BOOL DEFAULT TRUE,
    CONSTRAINT pk_servicos PRIMARY KEY (service_id),
    CONSTRAINT fk_servicos_categorias FOREIGN KEY (cat_service_id) 
        REFERENCES categorias_servico(cat_service_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;


CREATE TABLE estados_marcacao (
    estado_marc_id INT AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL UNIQUE,
    CONSTRAINT pk_estados_marcacao PRIMARY KEY (estado_marc_id)
)  ENGINE=INNODB;


CREATE TABLE marcacoes (
    marc_id INT AUTO_INCREMENT,
    animal_id INT NOT NULL,
    service_id INT NOT NULL,
    util_id INT NOT NULL, 
    estado_id INT NOT NULL,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME NOT NULL,
    observacoes TEXT,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    plano VARCHAR(100),
    CONSTRAINT pk_marcacoes PRIMARY KEY (marc_id),
    CONSTRAINT fk_marcacoes_animais FOREIGN KEY (animal_id) 
        REFERENCES animais(animal_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_marcacoes_servicos FOREIGN KEY (service_id) 
        REFERENCES servicos(service_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_marcacoes_utilizadores FOREIGN KEY (util_id) 
        REFERENCES utilizadores(util_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_marcacoes_estados FOREIGN KEY (estado_id) 
        REFERENCES estados_marcacao(estado_marc_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE denuncias (
    denuncia_id INT AUTO_INCREMENT,
    util_id INT NOT NULL,
    marc_id INT,
    categoria VARCHAR(100) NOT NULL,
    assunto VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    estado VARCHAR(50) DEFAULT 'Pendente',
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_denuncias PRIMARY KEY (denuncia_id),

    CONSTRAINT fk_denuncias_utilizadores FOREIGN KEY (util_id)
        REFERENCES utilizadores(util_id),

    CONSTRAINT fk_denuncias_marcacoes FOREIGN KEY (marc_id)
        REFERENCES marcacoes(marc_id)
) ENGINE=InnoDB;