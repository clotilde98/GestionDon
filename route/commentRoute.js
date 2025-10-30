import { Router } from 'express';
import {readAllComment, createComment, updateComment, deleteComment, searchCommentByDate} from '../controller/commentController.js';
const router = Router();

router.get('/',readAllComment);
router.get('/search', searchCommentByDate);
router.post('/',createComment);
router.patch('/', updateComment);
router.delete('/', deleteComment);


export default router;
