import { Router } from 'express';
import {checkJWT} from '../middleware/identification/jwt.js'
import {
  createUserWithAddress,
  getUserWithAddress,
  updateUserWithAddress,
  deleteUser,
  createUser
} from "../controller/userController.js";

const router = Router();

router.post("/", createUser);           
router.get("/:id", checkJWT, getUserWithAddress);         
router.patch("/", checkJWT, updateUserWithAddress);     
router.delete("/:id", checkJWT, deleteUser);       

export default router;