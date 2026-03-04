import Router from 'express';

import {createQuizRoom, deleteQuizRoom, lockQuizRoom, updateQuizRoom} from '../controllers/host.controller.js';

const router = Router();

router.post('/:id/createQuizRoom', createQuizRoom);
router.post('/:id/:roomId/lock', lockQuizRoom);
router.post('/:id/updateQuizRoom', updateQuizRoom);
router.delete('/:id/deleteQuizRoom', deleteQuizRoom);

// route -> getQuiz room -> After lock (under progress, after question - related - backend)

export default router;