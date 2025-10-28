import { Router } from 'express';
import {getReservation, createReservation, getReservationsByClientID, getReservationsByPostID, updateReservation, deleteReservation} from '../controller/reservationController.js'
const router = Router();


router.post("/", createReservation);           
router.get("/:id", getReservation);         
router.get("/client/:id", getReservationsByClientID);     
router.get("/post/:id", getReservationsByPostID);       
router.patch("/", updateReservation);
router.delete("/:id", deleteReservation);
export default router;