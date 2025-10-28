import { Router } from 'express';
import {getReservation, createReservation, getReservationByClientID, getReservationsByPostID} from '../controller/reservationController.js'
const router = Router();


router.post("/", createReservation);           
router.get("/:id", getReservation);         
router.get("/client/:id", getReservationByClientID);     
router.get("/post/:id", getReservationsByPostID);       

export default router;