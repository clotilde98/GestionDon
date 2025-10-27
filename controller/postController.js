import { pool } from "../database/database.js";

import * as postModel from '../model/postDB.js';

export const getPost = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id || isNaN(parseInt(id))){
            return res.status(400).send("Post ID invalid")
        }
        const post = await postModel.readPost(pool, {id});
        if (post){
            res.json(post);
        } else {
            res.sendStatus(404).send("Post not found");
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
}


export const createPost = async (req, res) => {
    try {
        const { post_date, title, number_of_places, address_id, client_id } = req.body;
        if (!post_date || !title || !number_of_places || !address_id || !client_id) {
            return res.status(400).send("Missing required fields");
        }
        const post = await postModel.createPost(pool, req.body);
        res.status.json(post);
    } catch (err){
        res.status(500).send(err.message);
    }
}

export const updatePost = async (req, res) => {
    try {
        const {number_of_places} = req.body
        if (number_of_places < 0){
            res.status(400).send("Number of places must be positive");
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
        await postModel.deletePost(pool, req.params); 
        res.sendStatus(204);
    } catch (err) {
        res.sendStatus(500);
    }
};