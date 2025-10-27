DROP TABLE IF EXISTS Addresse CASCADE;
DROP TABLE IF EXISTS User CASCADE;

CREATE TABLE Utilisateur (
    id_user SERIAL PRIMARY KEY,
    NomUser VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    registration_date DATE DEFAULT NOW(),
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
    post_status ENUM('available','unavailable') NOT NULL DEFAULT 'available',
    photo VARCHAR(255) NULL,
    address_id INT NOT NULL REFERENCES Address(id) ON DELETE CASCADE, 
    user_id INT NOT NULL REFERENCES User(id) ON DELETE CASCADE
);


-- Insérer l'utilisateur Clotilde et une adresse
INSERT INTO Utilisateur (username, email, password, is_admin)
VALUES ('Clotilde', 'clotilde@example.com', 'motdepasse', FALSE);

INSERT INTO Adresse (street, numero, city, postal_code, user_id)
VALUES ('Rue des Fleurs', 15, 'Namur', '5000', 1);

INSERT INTO Post (post_date, description, title, number_of_places, post_status, photo, address_id, user_id) 
VALUES 
('2025-10-27 10:00:00', 'Tres bonnes pommes', 'Pommes a donner', 3, 'available', NULL, 1, 1);
