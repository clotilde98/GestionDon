export const createReservation = async (SQLClient, {post_id, client_id}) => {
  const { rows } = await SQLClient.query(
    `INSERT INTO Reservation (post_id, client_id)
     VALUES ($1, $2)
     RETURNING * `,
    [post_id, client_id]
  );
  return rows[0];
};

export const readReservation = async (SQLClient, {id}) => {
    const {rows} = await SQLClient.query("SELECT * FROM Reservation WHERE id = $1", [id]);
    return rows[0];
};

export const readReservationByClientID = async (SQLClient, {id}) => {
    const {rows} = await SQLClient.query("SELECT * FROM Reservation WHERE client_id = $1", [id]);
    return rows[0];
};

export const readReservationsByPostID = async (SQLClient, {id}) => {
    const {rows} = await SQLClient.query("SELECT * FROM Reservation WHERE post_id = $1", [id]);
    return rows;
};


export const updateReservation = async(SQLClient, {id, reservation_date, reservation_status}) => {
    let query = "UPDATE reservation SET ";
    const querySet = [];
    const queryValues = [];
    
    if(reservation_date){
        queryValues.push(reservation_date);
        querySet.push(`reservation_date = $${queryValues.length}`);
    }

    if (reservation_status){
        queryValues.push(reservation_status);
        querySet.push(`reservation_status = $${queryValues.length}`);
    }


    if(queryValues.length > 0){
        queryValues.push(id);
        query += `${querySet.join(", ")} WHERE id = $${queryValues.length}`;
        return await SQLClient.query(query, queryValues);
    } else {
        throw new Error("No field given");
    }
};

export const deleteReservation = async (SQLClient, {id}) => {
    const {rowCount} = await SQLClient.query("DELETE FROM Reservation WHERE id = $1", [id]);
    return rowCount > 0;
};


