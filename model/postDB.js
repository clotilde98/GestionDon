// Créer une annonce
export const createPost = async (SQLClient, { post_date, description, title, number_of_places, photo, address_id, user_id}) => {
  const { rows } = await SQLClient.query(
    `INSERT INTO post (post_date, description, title, number_of_places, post_status, photo, address_id, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING * `,
    [post_date, description, title, number_of_places, 'available', photo, address_id, user_id]
  );
  return rows[0];
};
