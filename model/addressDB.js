export const createAddress = async (SQLClient, { street, number, city, postalCode }, clientID) => {
  const { rows } = await SQLClient.query(
    `INSERT INTO address (street, number, city, postal_code, client_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [street, number, city, postalCode, clientID]
  );
  return rows[0];
};

export const getAddressByUser = async (SQLClient, clientID) => {
  const { rows } = await SQLClient.query(
    `SELECT street, number, city, postal_code FROM address
     WHERE client_id = $1
     ORDER BY id
     LIMIT 1`,
    [clientID]
  );
  return rows[0];
};

export const updateAddress = async (SQLClient, id, { street, number, city, postalCode }) => {
    let query = "UPDATE address SET ";
    const querySet = []; 
    const queryValues = []; 

    if (street ) {
        queryValues.push(street);
        querySet.push(`street = $${queryValues.length}`);
    }

    if (number ) {
        queryValues.push(number);
        querySet.push(`number = $${queryValues.length}`);
    }

    if (city) {
        queryValues.push(city);
        querySet.push(`city = $${queryValues.length}`);
    }

    if (postalCode) {
        queryValues.push(postalCode);
        querySet.push(`postal_code = $${queryValues.length}`);
    }

    if (queryValues.length > 0) {
        queryValues.push(id);
        
        
        query += `${querySet.join(", ")} WHERE id = $${queryValues.length} RETURNING *`;
        
        const { rows } = await SQLClient.query(query, queryValues);
        return rows[0];

    } else {
        throw new Error("No field given");
    }
};

export const deleteAddress = async (SQLClient, id) => {
  const { rowCount } = await SQLClient.query(
    `DELETE FROM address WHERE id = $1`,
    [id]
  );
  return rowCount > 0;
};
