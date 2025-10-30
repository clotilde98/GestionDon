import { Router } from 'express';
import {checkJWT} from '../middleware/identification/jwt.js'
import {
  createUserWithAddress,
  getUserWithAddress,
<<<<<<< HEAD
  deleteUser
=======
  updateUserWithAddress,
  deleteUser,
  createUser
>>>>>>> 725ab1990e506c6539c3a77d0631aeed9b74304f
} from "../controller/userController.js";

const router = Router();

<<<<<<< HEAD
router.post("/", createUserWithAddress);           
router.get("/:id", getUserWithAddress);         
router.delete("/:id", deleteUser);       
=======
router.post("/", createUser);           
router.get("/:id", checkJWT, getUserWithAddress);         
router.patch("/", checkJWT, updateUserWithAddress);     
router.delete("/:id", checkJWT, deleteUser);       
>>>>>>> 725ab1990e506c6539c3a77d0631aeed9b74304f

export default router;