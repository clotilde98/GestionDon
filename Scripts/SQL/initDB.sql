DROP TABLE IF EXISTS Adresse CASCADE;
DROP TABLE IF EXISTS Utilisateur CASCADE;

CREATE TABLE Utilisateur (
    id_user SERIAL PRIMARY KEY,
    NomUser VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    date_inscription DATE DEFAULT NOW(),
    photo TEXT,
    is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE Adresse (
    idAdresse SERIAL PRIMARY KEY,
    rue VARCHAR(100) NOT NULL,
    numero INT NOT NULL,
    ville VARCHAR(50) NOT NULL,
    code_postal VARCHAR(10) NOT NULL,
    id_user INT REFERENCES Utilisateur(id_user) ON DELETE CASCADE
);

CREATE TABLE Post (
    id SERIAL PRIMARY KEY,
    post_date DATETIME NOT NULL,
    description VARCHAR(255) NOT NULL,
    title VARCHAR(50) NOT NULL,
    number_of_places INT NOT NULL,
    Annonce_status ENUM('disponible','indisponible') NOT NULL DEFAULT 'disponible',
    Photo VARCHAR(255) NULL,
    address_id INT NOT NULL,
    user_id INT NOT NULL,
    CONSTRAINT fk_address FOREIGN KEY (address_id) REFERENCES Addresse(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES User(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);


CREATE TABLE AnnonceDon (
  id_Annonce INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_poste DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Description TEXT NULL,
  titre VARCHAR(50) NOT NULL,
  nbplaces INT NOT NULL,
  Annonce_status ENUM('disponible','indisponible') NOT NULL DEFAULT 'disponible',
  Photo VARCHAR(255) NULL,
  id_Adresse INT NOT NULL,
  id_user INT NOT NULL,
  CONSTRAINT fk_annonce_adresse FOREIGN KEY (id_Adresse) REFERENCES Adresse(idAdresse)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_annonce_user FOREIGN KEY (id_user) REFERENCES Utilisateur(id_user)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_annonce_user (id_user),
  INDEX idx_annonce_status (Annonce_status)
) ENGINE=InnoDB;


-- Insérer l'utilisateur Clotilde et une adresse
INSERT INTO Utilisateur (NomUser, email, mot_de_passe, is_admin)
VALUES ('Clotilde', 'clotilde@example.com', 'motdepasse', FALSE);

INSERT INTO Adresse (rue, numero, ville, code_postal, id_user)
VALUES ('Rue des Fleurs', 15, 'Namur', '5000', 1);
