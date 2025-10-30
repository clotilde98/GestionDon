import {pool} from "../database/database.js";
import * as commentModel from "../model/comment.js";

export const readAllComment = async (req, res) => {
   try{
       const comments = await commentModel.readAllComments(pool);
       if(comments && comments.length > 0){
       res.status(200).send(comments);
       }else{
        res.status(404).send("No comment found"); 
       }
   }catch (err){
        console.log(err); 
       res.sendStatus(500);
   }
}

export const createComment = async (req, res) => {
    try{
        const commentCreated = await commentModel.createComment(pool, req.body);
         if(commentCreated){
            res.status(201).send(commentCreated);
        }else{
            res.status(404).send("Failed to create comment"); 
        }   
    }catch (e){
        res.sendStatus(500);
    }
}

export const updateComment= async(req, res) => {
    try {
        await commentModel.updateComment(pool, req.body);
        res.sendStatus(204)
    }catch(err){
        console.log(err); 
        res.sendStatus(500);
    }
}

export const deleteComment = async(req, res) =>{
    try{
        const commentDeleted= await commentModel.deleteComment(pool, req.body);
        if(!commentDeleted){
            res.status(404).send(`Comment with ID ${commentDeleted.id} not found`);
        }else{
             res.status(200).send(`Comment ${commentDeleted.id} deleted successfully`);
        }
    }catch (err){
        console.log(err); 
        res.sendStatus(500);
    }
}

export const searchCommentByDate=async(req, res) => {
    try{
        const comments = await commentModel.searchCommentByDate(pool, req.body);
        if(comments && comments.length > 0){
            res.status(200).send(comments);
       }else{
            res.status(404).send("No comment found for this date"); 
       }
    }catch (e) {
        res.sendStatus(500);
    }
}

