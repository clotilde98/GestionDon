import { pool } from "../database/database.js";

import {readPost} from '../model/postDB.js'

import {getUserById} from '../model/userDB.js'

import * as reservationModel from '../model/reservationDB.js';


export const getReservation = async (req, res) => {
    try {
        
        const id = req.params.id;
        if (!id || isNaN(parseInt(id))){
            return res.status(400).send("Reservation ID is invalid")
        }

        const reservation = await reservationModel.readReservation(pool, {id});
        if (reservation){
            res.send(reservation);
        } else {
            res.status(404).send("Reservation not found");
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export const getReservationsByClientID = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id || isNaN(parseInt(id))){
            return res.status(400).send("Client reservation ID is invalid")
        }
        const reservation = await reservationModel.readReservationsByClientID(pool, {id});
        if (reservation){
            res.send(reservation);
        } else {
            res.status(404).send("Client reservation not found");
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export const getReservationsByPostID = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id || isNaN(parseInt(id))){
            return res.status(400).send("Post reservations ID is invalid")
        }
        const reservation = await reservationModel.readReservationsByPostID(pool, {id});
        if (reservation){
            res.send(reservation);
        } else {
            res.status(404).send("Post reservations not found");
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
}


export const createReservation = async (req, res) => {
    try {
        const { post_id, client_id } = req.body;
        
        const post = await readPost(pool, {id : post_id});
        
        if (!post){
            res.status(404).send("Post doesn't exist");
        } else {
            const countCurrentReservationsForPost = await reservationModel.readReservationsByPostID(pool, {id:post_id});
            if (post.number_of_places > countCurrentReservationsForPost.length){
                const client = await getUserById(pool, client_id);
                if (!client){
                    res.status(404).send("User not found");
                } else {
                    const newReservation = await reservationModel.createReservation(pool, req.body);
                    res.status(201).send(newReservation.id);
                }
            } else {
                res.status(409).send("Le nombre de reservation pour l'annonce a atteint le nombre maximal");
            }
            
        }
    } catch (err){
        res.status(500).send(err.message);
    }
}

export const updateReservation = async (req, res) => {
    try {
        const {reservation_date, reservation_status} = req.body
        if (number_of_places < 0){
            res.status(400).send("Number of places must be positive");
        }
        await postModel.updatePost(pool, req.body);
        res.sendStatus(204)
    } catch (err){
        res.status(500).send(err.message);
    }
}

export const deleteReservation = async (req, res) => {
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