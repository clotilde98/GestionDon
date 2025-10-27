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

-- Insérer l'utilisateur Clotilde et une adresse
INSERT INTO Utilisateur (NomUser, email, mot_de_passe, is_admin)
VALUES ('Clotilde', 'clotilde@example.com', 'motdepasse', FALSE);

INSERT INTO Adresse (rue, numero, ville, code_postal, id_user)
VALUES ('Rue des Fleurs', 15, 'Namur', '5000', 1);
