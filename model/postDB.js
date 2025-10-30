export const createPost = async (SQLClient, {description, title, numberOfPlaces, photo, addressID, clientID}) => {
  const { rows } = await SQLClient.query(
    `INSERT INTO Post (description, title, number_of_places, post_status, photo, address_id, client_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING * `,
    [description, title, numberOfPlaces, 'available', photo, addressID, clientID]
  );
  return rows[0];
};



export const updatePost = async(SQLClient, {id, description, title, numberOfPlaces, postStatus, photo, addressID, clientID}) => {
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

    if (numberOfPlaces){
        queryValues.push(numberOfPlaces);
        querySet.push(`number_of_places = $${queryValues.length}`);
    }

    if (postStatus){
        queryValues.push(postStatus);
        querySet.push(`post_status = $${queryValues.length}`);
    }

    if (photo){
        queryValues.push(photo);
        querySet.push(`photo = $${queryValues.length}`);
    }

    if (addressID){
        queryValues.push(addressID);
        querySet.push(`address_id = $${queryValues.length}`);
    }


    if (clientID){
        queryValues.push(clientID);
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


export const searchPostByCategory = async (SQLClient,  {nameCategory}) => {
    const query = "SELECT * FROM Post p INNER JOIN Post_category pc ON p.id = pc.id_ad INNER JOIN Category_product cp ON cp.id_category = pc.id_category WHERE cp.name_category=$1";
    const {rows} = await SQLClient.query(query, [nameCategory]);
    return rows[0];
};

