// Créer un utilisateur
export const createUser = async (SQLClient, { username, email, password, photo = null, isAdmin = false}) => {
  const { rows } = await SQLClient.query(
    `INSERT INTO Client (username, email, password, photo, is_admin)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [username, email, password, photo , isAdmin]
  );
  return rows[0];
};

export const getUserById = async (SQLClient, id) => {
  const { rows } = await SQLClient.query(
    `SELECT  username, email, registration_date, photo, is_admin
     FROM Client
     WHERE id = $1`,
    [id]
  );
  return rows[0] ;
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


