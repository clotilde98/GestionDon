
export const createReservation = async (SQLClient, {postID, clientID}) => {
    const { rows } = await SQLClient.query(
    `INSERT INTO Reservation (post_id, client_id)
     VALUES ($1, $2)
     RETURNING * `,
    [postID, clientID]
    );
  return rows[0];
};

export const readReservation = async (SQLClient, {id}) => {
    const {rows} = await SQLClient.query("SELECT * FROM Reservation WHERE id = $1", [id]);
    return rows[0];
};

export const readReservationsByClientID = async (SQLClient, {id}) => {
    const {rows} = await SQLClient.query("SELECT * FROM Reservation WHERE client_id = $1", [id]);
    return rows;
};

export const readReservationsByPostID = async (SQLClient, {id}) => {
    const {rows} = await SQLClient.query("SELECT * FROM Reservation WHERE post_id = $1", [id]);
    return rows;
};


export const updateReservation = async(SQLClient, {id, reservationDate, reservationStatus}) => {
    let query = "UPDATE reservation SET ";
    const querySet = [];
    const queryValues = [];
    
    if(reservationDate){
        queryValues.push(reservationDate);
        querySet.push(`reservation_date = $${queryValues.length}`);
    }

    if (reservationStatus){
        queryValues.push(reservationStatus);
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


