import {Query} from "pg";

export const readAllTypesProduct = async (SQLClient)=>{
    let query="SELECT * FROM Category_product"; 
    const {rows}=await SQLClient.query(query);
    return rows;
}

export const createTypeProduct = async(SQLClient, {nameCategory}) => {
 const {rows}=await SQLClient.query("INSERT INTO Category_product(name_category) VALUES ($1) RETURNING id_category",
     [nameCategory]
 );
 return rows[0];
}

export const updateTypeProduct=async(SQLClient, {idCategory, nameCategory}) => {

    if(!nameCategory){
        throw new Error("No field given (Category name)");
    }
    let query="UPDATE Category_product SET name_category =$2 WHERE id_category=$1 ";
    return await SQLClient.query(query, [idCategory, nameCategory]);

}


export const deleteTypeProduct=async(SQLClient, {idCategory})=> {
   if(!idCategory){
       throw new Error("Category ID is required for deletion");
   }
   let query="DELETE FROM Category_product WHERE id_category=$1";
   const {rows} =await SQLClient.query(query, [idCategory]);
   return rows > 0;
}







