import { Router } from 'express';
import {
  createUserWithAddress,
  getUserWithAddress,
  updateUserWithAddress,
  deleteUser
} from "../controller/userController.js";

const router = Router();

router.post("/", createUserWithAddress);           
router.get("/:id", getUserWithAddress);         
router.patch("/", updateUserWithAddress);     
router.delete("/:id", deleteUser);       

export default router;