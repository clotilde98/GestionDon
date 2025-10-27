

CREATE TABLE Client (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    registration_date DATE DEFAULT NOW(),
    photo TEXT,
    is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE Address (
    id SERIAL PRIMARY KEY,
    street VARCHAR(100) NOT NULL,
    numero INT NOT NULL,
    city VARCHAR(50) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    client_id INT REFERENCES Client(id) ON DELETE CASCADE
);

CREATE TABLE Post (
    id SERIAL PRIMARY KEY,
    post_date TIMESTAMP NOT NULL,
    description VARCHAR(255) NOT NULL,
    title VARCHAR(50) NOT NULL,
    number_of_places INT NOT NULL,
    post_status VARCHAR(20) NOT NULL DEFAULT 'available',
    CHECK (post_status IN ('available', 'unavailable')),
    photo VARCHAR(255) NULL,
    address_id INT NOT NULL REFERENCES Address(id) ON DELETE CASCADE, 
    client_id INT NOT NULL REFERENCES Client(id) ON DELETE CASCADE
);


-- Insérer l'utilisateur Clotilde et une adresse
INSERT INTO Client (username, email, password, is_admin)
VALUES ('Clotilde', 'clotilde@example.com', 'motdepasse', FALSE);

INSERT INTO Address (street, numero, city, postal_code, client_id)
VALUES ('Rue des Fleurs', 15, 'Namur', '5000', 1);

INSERT INTO Post (post_date, description, title, number_of_places, post_status, photo, address_id, client_id) 
VALUES 
('2025-10-27 10:00:00', 'Tres bonnes pommes', 'Pommes a donner', 3, 'available', NULL, 1, 1);
