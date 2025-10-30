import { pool } from "../database/database.js";

import * as postModel from '../model/postDB.js';

export const getPost = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!id || isNaN(parseInt(id))){
            return res.status(400).send("Post ID invalid")
        }
        const post = await postModel.readPost(pool, {id});
        if (post){
            res.status(200).json(post);
        } else {
            res.status(404).send("Post not found");
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
}


export const createPost = async (req, res) => {
    try {
        const { title, numberOfPlaces, addressID, clientID } = req.body;
        if (!title || !numberOfPlaces || !addressID || !clientID) {
            return res.status(400).send("Missing required fields");
        }
 
        const post = await postModel.createPost(pool, req.body);
        res.status(201).send(post);
    } catch (err){
        res.status(500).send(err.message);
    }
}

export const updatePost = async (req, res) => {
    try {
        const {numberOfPlaces} = req.body
        if (numberOfPlaces < 0){
            return res.status(400).send("Number of places must be positive");
        }
        await postModel.updatePost(pool, req.body);
        res.sendStatus(204)
    } catch (err){
        res.status(500).send(err.message);
    }
}

export const deletePost = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id || isNaN(parseInt(id))){
            return res.status(400).send("Post ID invalid")
        }
        const rowCount = await postModel.deletePost(pool, { id });
        if (!rowCount) {
            return res.status(404).send("Post not found");
        }
        res.status(200).send("Post deleted");

    } catch (err) {
        res.sendStatus(500);
    }
};


export const searchPostByCategory = async(req, res) => {
    try {
         const posts = await postModel.searchPostByCategory(pool, req.body);
         res.status(200).send(posts);
    }catch(err){
        res.status(500).send(err.message);
    }
}