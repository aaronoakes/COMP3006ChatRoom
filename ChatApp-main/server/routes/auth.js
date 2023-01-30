import express from 'express';
import auth from '../controllers/auth.js';
import { encode } from '../middleware/auth_token.js';

const router = express.Router();
router
    .post('/:username', encode, auth.login)

export default router;