import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();



export const checkJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token missing or invalid" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.id,
            email: decoded.email,
        };
        next();
    } catch (err){
        return res.status(403).send("Token invalid");
    }
    
};