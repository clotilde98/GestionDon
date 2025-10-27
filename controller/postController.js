import { pool } from "../database/database.js";

import * as postModel from '../model/postDB.js';

export const getPost = async (req, res) => {
    try {
        const post = await postModel.getPost(pool, req.params);
        if (post){
            res.json(post);
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        res.sendStatus(500);
    }
}


export const createPost = async (req, res) => {
    try {
        const post = await postModel.createPost(pool, req.body);
        if (post){
            res.json(post);
        } else {
            res.sendStatus(404);
        }
    } catch (err){
        res.sendStatus(500);
    }
}

export const updatePost = async (req, res) => {
    try {
        await postModel.updatePost(pool, req.body);
        res.sendStatus(204)
    } catch (err){
        res.sendStatus(500);
    }
}

export const deletePost = async (req, res) => {
    try {
        await postModel.deletePost(pool, req.params); 
        res.sendStatus(204);
    } catch (err) {
        res.sendStatus(500);
    }
};