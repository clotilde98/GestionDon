
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


export const updateUser = async (SQLClient, { id, username, email, password, photo, isAdmin }) => {
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


export const findUsersByUsername = async (SQLClient, searchTerm) => {
    
    
    const searchPattern = `%${searchTerm}%`;

    // CORRECTION: Utiliser le searchPattern comme paramètre de requête pour éviter les injections SQL.
    const { rows } = await SQLClient.query(
        `SELECT id, username, email, registration_date, photo, is_admin
         FROM Client
         WHERE username ILIKE $1`, 
        [searchPattern] // Ajout du paramètre
    );

    return rows;
};


export const findUsersByUsernamePAGINATED = async (SQLClient, searchTerm, limit, offset) => {
    
    // Le terme de recherche avec des jokers (%) pour la recherche partielle insensible à la casse
    const searchPattern = `%${searchTerm}%`;

    // --- 1. Requête pour le COUNT TOTAL (sans pagination) ---
    const countQuery = await SQLClient.query(
        `SELECT COUNT(id) FROM Client
         WHERE username ILIKE $1`,
        [searchPattern]
    );
    const totalCount = parseInt(countQuery.rows[0].count, 10);
    
    // --- 2. Requête pour les DONNÉES PAGINÉES ---
    const { rows } = await SQLClient.query(
        `SELECT id, username, email, registration_date, photo, is_admin
         FROM Client
         WHERE username ILIKE $1
         ORDER BY username ASC 
         LIMIT $2 OFFSET $3`, // LIMIT et OFFSET appliquent la pagination
        [searchPattern, limit, offset]
    );

    // Retourne les données paginées ET le total
    return {
        totalCount: totalCount,
        users: rows
    };
};


export const updateUserWithAddress = async (req, res) => {
    let SQLClient; 
    
    try {
        
        const clientID = req.params.id; 
        const { client, address } = req.body;

        if (!client && !address) {
            return res.status(400).send("Veuillez fournir des données d'utilisateur ou d'adresse à mettre à jour.");
        }

        SQLClient = await pool.connect();
        await SQLClient.query("BEGIN"); 
        
        let userUpdated = null;
        let addressUpdated = null;

        if (client) {
          
            userUpdated = await userModel.updateUser(SQLClient, clientID, client); 
        }
        
        if (address) {
            
            addressUpdated = await addressModel.updateAddress(SQLClient, clientID, address); 
        }

        if ((client && !userUpdated) || (address && !addressUpdated)) {
             await SQLClient.query("ROLLBACK"); 
             return res.status(404).send("Utilisateur ou adresse non trouvée pour l'ID : " + clientID);
        }

        await SQLClient.query("COMMIT"); 


        return res.status(200).send({
            message: "Utilisateur et adresse mis à jour avec succès",
            userID: clientID,
            updatedUser: userUpdated || client, 
            updatedAddress: addressUpdated || address 
        });

    } catch (err) {
        console.error("Erreur lors de la mise à jour de l'utilisateur:", err); 
        
        if (SQLClient) { 
            try {
                await SQLClient.query("ROLLBACK");
            } catch (err) {
                console.error(err);
            }
        }
        
        return res.status(500).send("Erreur interne du serveur. La mise à jour a été annulée.");
        
    } finally {
        if (SQLClient) {
            SQLClient.release(); 
        }
    }
};


export const findUsersByUsernameAndFilter = async (SQLClient, searchTerm, adminFilter) => {
    
    // Le premier paramètre ($1) est toujours le searchPattern
    const searchPattern = `%${searchTerm}%`;
    let queryParams = [searchPattern];
    let whereClauses = [`username ILIKE $1`];
    
    // --- Logique du Filtre is_admin ---
    if (adminFilter === 'admins') {
        whereClauses.push(`is_admin = TRUE`);
    } else if (adminFilter === 'users') {
        whereClauses.push(`is_admin = FALSE`);
    }

    // Jointure de toutes les clauses WHERE
    const whereCondition = whereClauses.length > 0 ? `WHERE ` + whereClauses.join(' AND ') : '';

    const { rows } = await SQLClient.query(
        `SELECT id, username, email, registration_date, photo, is_admin
         FROM Client
         ${whereCondition}
         ORDER BY username ASC`, 
        queryParams
    );

    return rows; // Retourne la liste filtrée
};
