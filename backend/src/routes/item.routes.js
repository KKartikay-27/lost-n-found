import express from 'express';
import {
    createItem,
    deleteItem,
    getItemById,
    getItems,
    getMyItems,
    resolveItem,
    updateItem,
} from '../controllers/item.controller.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getItems);
router.get('/my-items', auth, getMyItems);
router.get('/:id', getItemById);
router.post('/', auth, createItem);
router.put('/:id', auth, updateItem);
router.patch('/:id/resolve', auth, resolveItem);
router.delete('/:id', auth, deleteItem);

export default router;
