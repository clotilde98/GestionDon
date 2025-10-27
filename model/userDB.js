// Créer un utilisateur
export const createUser = async (SQLClient, { username, email, password, photo = null, is_admin = false }) => {
  const { rows } = await SQLClient.query(
    `INSERT INTO Client (username, email, password, photo, is_admin)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [username, email, password, photo, is_admin]
  );
  return rows[0];
};

export const getUserById = async (SQLClient, id) => {
    const { rows } = await SQLClient.query(
        `SELECT id, username, email, registration_date, photo, is_admin
         FROM Client
         WHERE id = $1`,
        [id]
    );
    return rows[0] || null;
};

// Lire un utilisateur + sa première adresse
export const getUserWithAddress = async (SQLClient, id) => {
  const { rows } = await SQLClient.query(
    `SELECT c.id, c.username, c.email, c.registration_date, c.photo, c.is_admin,
            a.street, a.number, a.city, a.postal_code
     FROM Client c
     LEFT JOIN address a ON c.id = a.user_id
     WHERE c.id = $1
     ORDER BY a.id
     LIMIT 1`,
    [id]
  );
  return rows[0] || null; // Modification pour retourner explicitement null si non trouvé
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
