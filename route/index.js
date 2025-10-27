import Router  from 'express';
import userRouter from './userRoute.js';
import postRouter from './postRoute.js'

const router = Router();

router.use('/users', userRouter);
router.use('/posts', postRouter);

export default router;