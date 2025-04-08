import express from 'express';
import { protect, admin } from '../middlewares/auth.middleware.js';
import { getUsers, getUser, deleteUser } from '../controllers/users.controller.js';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', protect, admin, getUsers);

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private/Admin
router.get('/:id', protect, admin, getUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteUser);

export default router; 