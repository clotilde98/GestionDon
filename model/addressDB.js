
// Créer une adresse pour un utilisateur
export const createAddress = async (SQLClient, { rue, numero, ville, code_postal }, id_user) => {
  const { rows } = await SQLClient.query(
    `INSERT INTO Adresse (rue, numero, ville, code_postal, id_user)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING idAdresse, rue, numero, ville, code_postal, id_user`,
    [rue, numero, ville, code_postal, id_user]
  );
  return rows[0];
};

// Récupérer la première adresse d'un utilisateur
export const getAddressByUser = async (SQLClient, id_user) => {
  const { rows } = await SQLClient.query(
    `SELECT * FROM Adresse
     WHERE id_user = $1
     ORDER BY idAdresse
     LIMIT 1`,
    [id_user]
  );
  return rows[0] ;
};

// Mettre à jour la première adresse d'un utilisateur
export const updateAddress = async (SQLClient, idAdresse, { rue, numero, ville, code_postal }) => {
    const { rows } = await SQLClient.query(
        `UPDATE Adresse
         SET rue = COALESCE($1, rue),
             numero = COALESCE($2, numero),
             ville = COALESCE($3, ville),
             code_postal = COALESCE($4, code_postal)
         WHERE idAdresse = $5`,
        [rue, numero, ville, code_postal, idAdresse]
    );
    return rows[0];
};


// Supprimer une adresse
export const deleteAddress = async (SQLClient, idAdresse) => {
    const { rowCount } = await SQLClient.query(
        `DELETE FROM Adresse WHERE idAdresse = $1`,
        [idAdresse]
    );
    return rowCount > 0;
};