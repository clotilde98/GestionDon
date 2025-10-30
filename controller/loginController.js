import {getUserByEmail} from '../model/userDB.js';
import { pool } from "../database/database.js";
import argon2 from "argon2";
import 'dotenv/config';
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await getUserByEmail(pool, email)
        if (!user){
            return res.status(401).send("User/Password incorrect");
        }
        const validPassword = await argon2.verify(user.password, password + process.env.PEPPER);
        if (!validPassword) {
            return res.status(401).send("User/Password incorrect");
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );
        res.send({ token });
    } catch (err){
        res.status(500).send(err.message);
    }
}