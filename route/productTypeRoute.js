import Router from 'express';
import {readAllTypesProduct, createTypeProduct, updateTypeProduct, deleteTypeProduct} from '../controller/productTypeController.js';
const router = Router();

router.get('/', readAllTypesProduct);

router.post('/', createTypeProduct);
router.patch('/', updateTypeProduct);
router.delete('/', deleteTypeProduct);


export default router;

