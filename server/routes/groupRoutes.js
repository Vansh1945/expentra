import express from 'express';
import { createGroup, getGroups, getGroupById, addMemberToGroup, updateMemberInGroup, removeMemberFromGroup } from '../controllers/groupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createGroup)
    .get(protect, getGroups);

router.route('/:id')
    .get(protect, getGroupById);

router.route('/:id/members')
    .put(protect, addMemberToGroup);

router.route('/:id/members/:memberId')
    .put(protect, updateMemberInGroup)
    .delete(protect, removeMemberFromGroup);

export default router;
