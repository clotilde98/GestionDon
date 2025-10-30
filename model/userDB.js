
import 'dotenv/config';
import argon2 from "argon2";






// Créer un utilisateur
export const createUser = async (SQLClient, { username, email, password, photo = null, is_admin = false }) => {
  const pepper = process.env.PEPPER;
  const passwordWithPepper = password + pepper;
  const hash = await argon2.hash(passwordWithPepper);
  const { rows } = await SQLClient.query(
    `INSERT INTO Client (username, email, password, photo, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [username, email, hash, photo, is_admin]
  );
  return rows[0];
};

export const getUserById = async (SQLClient, id) => {
  const { rows } = await SQLClient.query(
    `SELECT id, username, password, email, registration_date, photo, is_admin
     FROM Client
     WHERE id = $1`,
    [id]
  );
  return rows[0] ;
};

export const getUserByEmail = async (SQLClient, email) => {
  const { rows } = await SQLClient.query(
    `SELECT *
     FROM Client
     WHERE email = $1`,
    [email]
  );
  return rows[0] || null;
};



// Lire un utilisateur + sa première adresse
export const getUserWithAddress = async (SQLClient, id) => {
  const { rows } = await SQLClient.query(
    `SELECT c.id, c.username, c.email, c.password, c.registration_date, c.photo, c.is_admin,
            a.street, a.numero, a.city, a.postal_code
    FROM Client c
    LEFT JOIN Address a ON c.id = a.Client_id
    WHERE c.id = $1
    ORDER BY a.id
    LIMIT 1`,
    [id]
  );

  return rows[0] || null; 
};

// Mettre à jour un utilisateur
export const updateUser = async (SQLClient, { id, username, email, password, photo, is_admin }) => {
  const { rows } = await SQLClient.query(
    `UPDATE Client
     SET username = COALESCE($1, username),
         email = COALESCE($2, email),
         password = COALESCE($3, password),
         photo = COALESCE($4, photo),
         is_admin = COALESCE($5, is_admin)
     WHERE id = $6
     RETURNING *`,
    [username, email, password, photo, is_admin, id]
  );
  return rows[0] || null;
};

// Supprimer un utilisateur
export const deleteUser = async (SQLClient, id) => {
  const { rowCount } = await SQLClient.query(
    'DELETE FROM Client WHERE id = $1',
    [id]
  );
  return rowCount > 0;
};


