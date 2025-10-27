import { Router } from 'express';
import {
  createUserWithAddresses,
  getUserWithAddress,
  updateUserWithAddress,
  deleteUser
} from "../controller/userController.js";

const router = Router();

router.post("/", createUserWithAddresses);           
router.get("/:id", getUserWithAddress);         
router.patch("/:id", updateUserWithAddress);     
router.delete("/:id", deleteUser);       

export default router;