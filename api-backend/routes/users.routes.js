const express = require('express');

const { asyncHandler } = require('../middleware/asyncHandler');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validateObjectId');
const {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/users.controller');

const router = express.Router();

router.get('/', requireAuth, requireAdmin, asyncHandler(listUsers));
router.post('/', requireAuth, requireAdmin, asyncHandler(createUser));
router.get('/:id', requireAuth, requireAdmin, validateObjectId('id'), asyncHandler(getUserById));
router.patch('/:id', requireAuth, requireAdmin, validateObjectId('id'), asyncHandler(updateUser));
router.delete('/:id', requireAuth, requireAdmin, validateObjectId('id'), asyncHandler(deleteUser));

module.exports = router;
