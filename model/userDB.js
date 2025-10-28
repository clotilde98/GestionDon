// Créer un utilisateur
export const createUser = async (SQLClient, { username, email, password, photo = null, is_admin = false }) => {
  const { rows } = await SQLClient.query(
    `INSERT INTO users (username, email, password, photo, is_admin)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, username, email, date_inscription, photo, is_admin`,
    [username, email, password, photo, is_admin]
  );
  return rows[0];
};

export const getUserById = async (SQLClient, id) => {
  const { rows } = await SQLClient.query(`SELECT * FROM Client WHERE id = $1`, [id]);
  return rows[0];
}; 

// Lire un utilisateur + sa première adresse
export const getUserWithAddress = async (SQLClient, id) => {
  const { rows } = await SQLClient.query(
    `SELECT u.id, u.username, u.email, u.date_inscription, u.photo, u.is_admin,
            a.street, a.number, a.city, a.postal_code
     FROM users u
     LEFT JOIN addresses a ON u.id = a.user_id
     WHERE u.id = $1
     ORDER BY a.id
     LIMIT 1`,
    [id]
  );
  return rows[0];
};

// Mettre à jour un utilisateur
export const updateUser = async (SQLClient, { id, username, email, password, photo, is_admin }) => {
  const { rows } = await SQLClient.query(
    `UPDATE users
     SET username = COALESCE($1, username),
         email = COALESCE($2, email),
         password = COALESCE($3, password),
         photo = COALESCE($4, photo),
         is_admin = COALESCE($5, is_admin)
     WHERE id = $6
     RETURNING id, username, email, date_inscription, photo, is_admin`,
    [username, email, password, photo, is_admin, id]
  );
  return rows[0] || null;
};

// Supprimer un utilisateur
export const deleteUser = async (SQLClient, id) => {
  const { rowCount } = await SQLClient.query(
    'DELETE FROM users WHERE id = $1',
    [id]
  );
  return rowCount > 0;
};
