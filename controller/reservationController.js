import { pool } from "../database/database.js";

import {readPost} from '../model/postDB.js'

import {getUserById} from '../model/userDB.js'

import * as reservationModel from '../model/reservationDB.js';


export const getReservation = async (req, res) => {
    try {
        
        const id = parseInt(req.params.id);
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
        const id = parseInt(req.params.id);
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
        const id = parseInt(req.params.id);
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
        const { postID, clientID } = req.body;
        
        const post = await readPost(pool, {id : postID});
        
        if (!post){
            res.status(404).send("Post doesn't exist");
        } else {
            const countCurrentReservationsForPost = await reservationModel.readReservationsByPostID(pool, {id:postID});
            if (post.number_of_places > countCurrentReservationsForPost.length){
                const client = await getUserById(pool, clientID);
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
        const {reservationDate, reservationStatus} = req.body
        if (reservationDate){
            const reservationTimestamp = new Date(reservationDate).getTime();

            if (reservationTimestamp < Date.now()) {
                return res.status(409).send("Reservation date cannot be in the past");
            }
        }

        if (reservationStatus){
            if (reservationStatus !== 'confirmed' && reservationStatus !== 'cancelled'){
                return res.status(409).send("Reservation status can only either be 'confirmed' or 'cancelled'");
            }
        }


        await reservationModel.updateReservation(pool, req.body);
        res.sendStatus(204)
        
    } catch (err){
        res.status(500).send(err.message);
    }
}

export const deleteReservation = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id || isNaN(parseInt(id))){
            return res.status(400).send("Reservation ID invalid")
        }
        const rowCount = await reservationModel.deleteReservation(pool, req.params); 
        if (!rowCount){
            return res.status(404).send(`Reservation with ID ${id} not found`);
        } else {
            res.status(200).send(`Reservation ${id} deleted successfully`);
        }
        
    } catch (err) {
        res.status(500).send(err.message);
    }
};