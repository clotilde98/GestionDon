import { Router } from 'express';
import {
  createUserWithAddresses,
  getUserWithAddress,
  updateUserWithAddress,
  deleteUser,
  createUser
} from "../controller/userController.js";

const router = Router();

router.post("/", createUser);           
router.get("/:id", getUserWithAddress);         
router.patch("/", updateUserWithAddress);     
router.delete("/:id", deleteUser);       

export default router;