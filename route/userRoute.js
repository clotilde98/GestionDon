import { Router } from 'express';
import {
  createUserWithAddress,
  getUserWithAddress,
  deleteUser
} from "../controller/userController.js";

const router = Router();

router.post("/", createUserWithAddress);           
router.get("/:id", getUserWithAddress);         
router.delete("/:id", deleteUser);       

export default router;