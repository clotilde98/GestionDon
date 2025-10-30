export const readAllComments = async (SQLClient) => {
    let query="SELECT * FROM Comment";
    const {rows}=await SQLClient.query(query);
    return rows;
}

export const deleteComment = async (SQLClient, {id})=>{
    let query="DELETE FROM Comment WHERE id=$1";
    const {rows} = await SQLClient.query(query, [id]);
    return rows > 0;
}

export const createComment = async (SQLClient, {content, idPost, idCostumer}) => {
    let query = "INSERT INTO Comment(content, id_post, id_costumer) VALUES ($1, $2, $3) RETURNING id";
    const {rows} = await SQLClient.query(query, [content, idPost, idCostumer]);
    return rows[0];
}

export const updateComment = async (SQLClient, {id, content}) => {
    if(!content){
        throw new Error("Miss a field given(content)");
    }
    if(!id){
        throw new Error("Miss a field given (id)"); 
    }
    let query="UPDATE Comment SET content=$2 WHERE id=$1";
    return await SQLClient.query(query, [id, content]);
}

export const searchCommentByDate = async (SQLClient, {date}) => {
    let query="SELECT * FROM Comment WHERE date=$1"; 
    const {rows} = await SQLClient.query(query, [date]);
    return rows;
}