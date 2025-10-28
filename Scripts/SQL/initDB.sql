DROP TABLE IF EXISTS Reservation;
DROP TABLE IF EXISTS Post;
DROP TABLE IF EXISTS Address;
DROP TABLE IF EXISTS Client;

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
    CHECK (numero > 0),
    client_id INT REFERENCES Client(id) ON DELETE CASCADE
);

CREATE TABLE Post (
    id SERIAL PRIMARY KEY,
    post_date DATE DEFAULT NOW(),
    description VARCHAR(255) NOT NULL,
    title VARCHAR(50) NOT NULL,
    number_of_places INT NOT NULL,
    post_status VARCHAR(20) NOT NULL DEFAULT 'available',
    CHECK (number_of_places > 0),
    CHECK (post_status IN ('available', 'unavailable')),
    photo VARCHAR(255) NULL,
    address_id INT NOT NULL REFERENCES Address(id) ON DELETE CASCADE, 
    client_id INT NOT NULL REFERENCES Client(id) ON DELETE CASCADE
);

CREATE TABLE Reservation (
    id SERIAL PRIMARY KEY,
    reservation_date DATE DEFAULT NOW(),
    reservation_status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
    CHECK (reservation_status IN ('confirmed', 'cancelled')),
    post_id INT NOT NULL REFERENCES Post(id) ON DELETE CASCADE,
    client_id INT NOT NULL REFERENCES Client(id) ON DELETE CASCADE
);




-- Insérer l'utilisateur Clotilde et une adresse
INSERT INTO Client (username, email, password, is_admin)
VALUES ('Clotilde', 'clotilde@example.com', 'motdepasse', FALSE);

INSERT INTO Address (street, numero, city, postal_code, client_id)
VALUES ('Rue des Fleurs', 15, 'Namur', '5000', 1);

INSERT INTO Post (description, title, number_of_places, post_status, photo, address_id, client_id) 
VALUES 
('Tres bonnes pommes', 'Pommes a donner', 3, 'available', NULL, 1, 1);

INSERT INTO Reservation (post_id, client_id) VALUES (1, 1);
