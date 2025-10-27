
// Créer un utilisateur
export const createUser = async (SQLClient, { NomUser, email, mot_de_passe, photo = null, is_admin = false }) => {
  const { rows } = await SQLClient.query(
    `INSERT INTO Utilisateur (NomUser, email, mot_de_passe, photo, is_admin)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_user, NomUser, email, date_inscription, photo, is_admin`,
    [NomUser, email, mot_de_passe, photo, is_admin]
  );
  return rows[0];
};

// Lire un utilisateur + sa première adresse
export const getUserWithAddress = async (SQLClient, id_user) => {
  const { rows } = await SQLClient.query(
    `SELECT  u.NomUser, u.email, u.date_inscription, u.photo, u.is_admin,
             a.rue, a.numero, a.ville, a.code_postal
     FROM Utilisateur u
     LEFT JOIN Adresse a ON u.id_user = a.id_user
     WHERE u.id_user = $1
     ORDER BY a.id_user
     LIMIT 1`,
    [id_user]
  );
  return rows[0] ;
};

// Mettre à jour un utilisateur
export const updateUser = async (SQLClient, { id_user, NomUser, email, mot_de_passe, photo, is_admin }) => {
  const { rows } = await SQLClient.query(
    `UPDATE Utilisateur
     SET NomUser = COALESCE($1, NomUser),
         email = COALESCE($2, email),
         mot_de_passe = COALESCE($3, mot_de_passe),
         photo = COALESCE($4, photo),
         is_admin = COALESCE($5, is_admin)
     WHERE id_user = $6
     RETURNING id_user, NomUser, email, date_inscription, photo, is_admin`,
    [NomUser, email, mot_de_passe, photo, is_admin, id_user]
  );
  return rows[0] || null;
};

// Supprimer un utilisateur
export const deleteUser = async (SQLClient, id_user) => {
  const { rowCount } = await SQLClient.query(
    'DELETE FROM Utilisateur WHERE id_user = $1',
    [id_user]
  );
  return rowCount > 0;
};
