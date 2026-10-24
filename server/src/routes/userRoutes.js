const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, toggleUserStatus } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getUsers);
router.patch('/:id/role', authorize('admin'), updateUserRole);
router.patch('/:id/status', authorize('admin'), toggleUserStatus);

module.exports = router;
