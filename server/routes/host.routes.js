import Router from 'express';

import {createQuestion,
        createQuizRoom, 
        deleteQuizRoom,
        lockQuizRoom, 
        updateQuizRoom,
        getQuestionById,
        updateQuestion,
        deleteQuestion,
        getQuestions
    } from '../controllers/host.controller.js';

const router = Router();

router.post('/:id/createQuizRoom', createQuizRoom);
router.post('/:id/:roomId/lock', lockQuizRoom);
router.post('/:id/updateQuizRoom', updateQuizRoom);
router.delete('/:id/deleteQuizRoom', deleteQuizRoom);

router.post('/:id/:roomId/createQuestion', createQuestion);
router.get("/:id/:roomId/questions/:questionId",  getQuestionById);  
router.put("/:id/:roomId/questions/:questionId",  updateQuestion);   
router.delete("/:id/:roomId/questions/:questionId", deleteQuestion); 

router.get("/:id/:roomId/questions",getQuestions);      


export default router;