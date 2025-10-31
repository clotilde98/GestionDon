
import 'dotenv/config';
import argon2 from "argon2";


// Créer un utilisateur
export const createUser = async (SQLClient, { username, email, password,number,street, photo = null, is_admin = false }) => {
  const pepper = process.env.PEPPER;
  const passwordWithPepper = password + pepper;
  const hash = await argon2.hash(passwordWithPepper);
  const { rows } = await SQLClient.query(
    `INSERT INTO Client (username, email, password,number,street, photo, is_admin) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [username, email, hash,number,street,photo, is_admin]
  );
  return rows[0];
};

export const getUserById = async (SQLClient, id) => {
  const { rows } = await SQLClient.query(
    `SELECT *
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

export const updateAddress = async (SQLClient, id, { username, email, password, photo,isAdmin }) => {
    let query = "UPDATE Client SET ";
    const querySet = []; 
    const queryValues = []; 

    if (username ) {
        queryValues.push(username);
        querySet.push(`username = $${queryValues.length}`);
    }
    
    if (email ) {
        queryValues.push(email);
        querySet.push(`email = $${queryValues.length}`);
    }
    
    if (password ) {
        queryValues.push(password);
        querySet.push(`password = $${queryValues.length}`);
    }
    
    if (photo) {
        queryValues.push(photo);
        querySet.push(`photo = $${queryValues.length}`);
    }
    
    if (isAdmin) { 
        queryValues.push(isAdmin);
        querySet.push(`is_admin = $${queryValues.length}`);
    }

    if (queryValues.length > 0) {
        queryValues.push(id);
        
        query += `${querySet.join(", ")} WHERE id = $${queryValues.length} RETURNING *`;
        
        return SQLClient.query(query, queryValues);

    } else {
        throw new Error("No field given for user update.");
    }
};

// Supprimer un utilisateur
export const deleteUser = async (SQLClient, id) => {
  const { rowCount } = await SQLClient.query(
    'DELETE FROM Client WHERE id = $1',
    [id]
  );
  return rowCount > 0;
};


