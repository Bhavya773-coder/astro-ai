const express = require('express');

const { asyncHandler } = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validateObjectId');
const {
  createProfile,
  listProfiles,
  getProfileById,
  updateProfile,
  deleteProfile
} = require('../controllers/profiles.controller');

const router = express.Router();

router.get('/', requireAuth, asyncHandler(listProfiles));
router.post('/', requireAuth, asyncHandler(createProfile));
router.get('/:id', requireAuth, validateObjectId('id'), asyncHandler(getProfileById));
router.patch('/:id', requireAuth, validateObjectId('id'), asyncHandler(updateProfile));
router.delete('/:id', requireAuth, validateObjectId('id'), asyncHandler(deleteProfile));

module.exports = router;
