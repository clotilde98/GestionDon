export const createPost = async (SQLClient, {description, title, number_of_places, photo, address_id, client_id}) => {
  const { rows } = await SQLClient.query(
    `INSERT INTO Post (description, title, number_of_places, post_status, photo, address_id, client_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING * `,
    [description, title, number_of_places, 'available', photo, address_id, client_id]
  );
  return rows[0];
};



export const updatePost = async(SQLClient, {id, description, title, number_of_places, post_status, photo, address_id, client_id}) => {
    let query = "UPDATE post SET ";
    const querySet = [];
    const queryValues = [];
    
    if(description){
        queryValues.push(description);
        querySet.push(`description = $${queryValues.length}`);
    }

    if (title){
        queryValues.push(title);
        querySet.push(`title = $${queryValues.length}`);
    }

    if (number_of_places){
        queryValues.push(number_of_places);
        querySet.push(`number_of_places = $${queryValues.length}`);
    }

    if (post_status){
        queryValues.push(post_status);
        querySet.push(`post_status = $${queryValues.length}`);
    }

    if (photo){
        queryValues.push(photo);
        querySet.push(`photo = $${queryValues.length}`);
    }

    if (address_id){
        queryValues.push(address_id);
        querySet.push(`address_id = $${queryValues.length}`);
    }

    if (client_id){
        queryValues.push(client_id);
        querySet.push(`client_id = $${queryValues.length}`);
    }


    if(queryValues.length > 0){
        queryValues.push(id);
        query += `${querySet.join(", ")} WHERE id = $${queryValues.length}`;
        return await SQLClient.query(query, queryValues);
    } else {
        throw new Error("No field given");
    }
};

export const deletePost = async (SQLClient, {id}) => {
    const {rowCount} = await SQLClient.query("DELETE FROM Post WHERE id = $1", [id]);
    return rowCount > 0;
};

export const readPost = async (SQLClient, {id}) => {
    const {rows} = await SQLClient.query("SELECT * FROM Post WHERE id = $1", [id]);
    return rows[0];
};

