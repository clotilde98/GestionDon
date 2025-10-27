import { Router } from 'express';
import {getPost, createPost, updatePost, deletePost} from '../controller/postController.js'
const router = Router();

router.post("/", createPost);           
router.get("/:id", getPost);         
router.patch("/", updatePost);     
router.delete("/:id", deletePost);       

export default router;