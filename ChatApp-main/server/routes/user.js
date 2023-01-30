import express from 'express';
// controllers
import user from '../controllers/user.js';

const router = express.Router();

router
  .post('/', user.createUser)  
  .get('/:id', user.getUserById)
  .get('/', user.getAllUsers)
  .delete('/:id', user.deleteUserById)

export default router;