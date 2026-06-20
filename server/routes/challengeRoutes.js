import express from 'express';
import { getChallengeStatus, completeQuest } from '../controllers/challengeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/status', protect, getChallengeStatus);
router.post('/complete-quest', protect, completeQuest);

export default router;
