import Router  from 'express';
import userRouter from './userRoute.js';
import postRouter from './postRoute.js'
import reservationRouter from './reservationRoute.js'

const router = Router();

router.use('/users', userRouter);
router.use('/posts', postRouter);
router.use('/reservation', reservationRouter);

export default router;