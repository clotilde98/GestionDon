export const createPost = async (SQLClient, { post_date, description, title, number_of_places, photo, address_id, user_id}) => {
  const { rows } = await SQLClient.query(
    `INSERT INTO post (post_date, description, title, number_of_places, post_status, photo, address_id, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING * `,
    [post_date, description, title, number_of_places, 'available', photo, address_id, user_id]
  );
  return rows[0];
};



export const updatePost = async(SQLClient, {id, post_date, description, title, number_of_places, photo, address_id, user_id}) => {
    let query = "UPDATE post SET ";
    const querySet = [];
    const queryValues = [];
    if(post_date){
        queryValues.push(post_date);
        querySet.push(`post_date = $${queryValues.length}`);
    }
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

    if (photo){
        queryValues.push(photo);
        querySet.push(`photo = $${queryValues.length}`);
    }

    if (address_id){
        queryValues.push(photo);
        querySet.push(`photo = $${queryValues.length}`);
    }

    if (user_id){
        queryValues.push(user_id);
        querySet.push(`user_id = $${queryValues.length}`);
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

d