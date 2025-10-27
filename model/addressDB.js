// Créer une adresse pour un utilisateur
export const createAddress = async (SQLClient, { street, number, city, postal_code }, user_id) => {
  const { rows } = await SQLClient.query(
    `INSERT INTO address (street, number, city, postal_code, user_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [street, number, city, postal_code, user_id]
  );
  return rows[0];
};

// Récupérer la première adresse d'un utilisateur
export const getAddressByUser = async (SQLClient, user_id) => {
  const { rows } = await SQLClient.query(
    `SELECT * FROM address
     WHERE user_id = $1
     ORDER BY id
     LIMIT 1`,
    [user_id]
  );
  return rows[0];
};

// Mettre à jour la première adresse d'un utilisateur
export const updateAddress = async (SQLClient, id, { street, number, city, postal_code }) => {
  const { rows } = await SQLClient.query(
    `UPDATE address
     SET street = COALESCE($1, street),
         number = COALESCE($2, number),
         city = COALESCE($3, city),
         postal_code = COALESCE($4, postal_code)
     WHERE id = $5
     RETURNING *`,
    [street, number, city, postal_code, id]
  );
  return rows[0];
};

// Supprimer une adresse
export const deleteAddress = async (SQLClient, id) => {
  const { rowCount } = await SQLClient.query(
    `DELETE FROM address WHERE id = $1`,
    [id]
  );
  return rowCount > 0;
};
