import {prisma} from '../services/prisma.services.js'

export const createQuizRoom = async (req, res) => {
  try {
    const {id} = req.params;

    const number_id = Number(id);

  const {title, desc, user_id, user_password, mod_id, mod_password} = req.body;

  if(!id){
    return res
    .status(400)
    .json({message: "User not found"})
  }
  
  const user = await prisma.users.findUnique({
    where: {
      id: number_id
    }
  });

  if(user.length === 0){
    return res
    .status(400)
    .json({message: "User not found"})
  }

  if(!title || !desc || !user_id || !user_password || !mod_id || !mod_password){
    return res
    .status(400)
    .json({message: "All fields are required"})
  }

  const room = await prisma.quizRoom.create({
    data: {
      title,
      desc,
      user_id,
      user_password,
      mod_id,
      mod_password,
      
      host: {
        connect: { id: number_id}
      },      
    }
  });


  return res
  .status(200)
  .json({
    message: "Quiz room created successfully",
    data: {
      roomId: room.id,
      title
    }
  })
  } catch (error) {
    console.log(error);

    return res
    .status(500)
    .json({message: "Something went wrong while creating a quiz room"});
  }
}

export const lockQuizRoom = async (req, res) => {
  try {
    const {id, roomId} = req.params;

  const number_id = Number(id);
  const number_roomId = Number(roomId);

  if(!id){
    return res
    .status(400)
    .json({message: "User not found"})
  };
  
  if(!roomId){
    return res
    .status(400)
    .json({message: "Quiz Room not fount"});
  }

  const user = await prisma.users.findUnique({
    where: {
      id: number_id
    }
  });

  if(user.length === 0){
    return res
    .status(400)
    .json({message: "User not found"})
  }

  const room = await prisma.quizRoom.findUnique({
    where: {
      id: number_roomId
    }
  });

  if(room.length === 0){
    return res
    .status(400)
    .json({message: "Quiz Room not found"})
  }

  if(room.hostId != id){
    return res
    .status(403)
    .json({message: "Only host has access to the quiz room"});
  }

  if(room.isLocked == true){
    return res
    .status(409)
    .json({message: "Room is already locked"});
  }

  await prisma.quizRoom.update({
    where: {
      id: number_roomId
    },
    data: {
      isLocked: true
    }
  });

  return res
  .status(200)
  .json({message: "Room locked successfully, no more changes can be made"})
  } catch (error) {
    return res
    .status(500)
    .json({message: "Something went wrong while locking the room"});
  }
}

export const updateQuizRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const number_id = Number(id);

    const { title, desc, user_id, user_password, mod_id, mod_password } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ message: "Room ID is required" });
    }

    const existingRoom = await prisma.quizRoom.findUnique({
      where: {
        id: number_id,
      },
    });

    if (!existingRoom) {
      return res
        .status(404)
        .json({ message: "Quiz room not found" });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (desc) updateData.desc = desc;
    if (user_id) updateData.user_id = user_id;
    if (user_password) updateData.user_password = user_password;
    if (mod_id) updateData.mod_id = mod_id;
    if (mod_password) updateData.mod_password = mod_password;

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ message: "At least one field is required to update" });
    }

    const updatedRoom = await prisma.quizRoom.update({
      where: {
        id: number_id,
      },
      data: updateData,
    });

    return res
      .status(200)
      .json({
        message: "Quiz room updated successfully",
        data: updatedRoom,
      });
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ message: "Something went wrong while updating the quiz room" });
  }
};

export const deleteQuizRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const number_id = Number(id);

    if (!id) {
      return res
        .status(400)
        .json({ message: "Room ID is required" });
    }

    const existingRoom = await prisma.quizRoom.findUnique({
      where: {
        id: number_id,
      },
    });

    if (!existingRoom) {
      return res
        .status(404)
        .json({ message: "Quiz room not found" });
    }

    await prisma.quizRoom.delete({
      where: {
        id: number_id,
      },
    });

    return res
      .status(200)
      .json({
        message: "Quiz room deleted successfully",
        data: {
          roomId: number_id,
        },
      });
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ message: "Something went wrong while deleting the quiz room" });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const {id, roomId} = req.params
    const {question, desc, option_a, option_b, option_c, option_d, correct_option, time} = req.body

    const number_id = Number(id);
    const number_roomId = Number(roomId);

    let Time = 45;
    if(time) time = Time;

    if(!id){
      return res
      .status(400)
      .json({message: "User not found"})
    }

    if(!roomId){
      return res
      .status(400)
      .json({message: "User not found"})
    }

    const quizRoom = await prisma.quizRoom.findUnique({
      where: {
        id: number_roomId
      }
    })

    if(!quizRoom){
      return res
      .status(400)
      .json({message: "Quiz Room not found"});
    }

    if(quizRoom.hostId != number_id){
      return res
      .status(403)
      .json({message: "Only hosts are allowed to add questions"})
    }

    if(!question || !desc || !option_a || !option_b || !option_c || !option_d || !correct_option ){
       return res
       .status(401)
       .json({message: "All fields are required"})
    }

    const quest = await prisma.questions.create({
      data:{
        question,
        desc,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        time: Time,

        qRId: {
          connect: {id: number_roomId}
        }
      }
    })

    return res
    .status(200)
    .json({
      message: "Question created successfully",
      data: {
        id: quest.id,
        desc
      }
    })

  } catch (error) {
    console.log(error);

    return res
    .status(500)
    .json({message: "Something went wrong while creating the question"})
  }
}

export const getQuestions = async (req, res) => {
  try {
    const { id, roomId } = req.params;

    const number_id = Number(id);
    const number_roomId = Number(roomId);

    if (!id) {
      return res
        .status(400)
        .json({ message: "User not found" });
    }

    if (!roomId) {
      return res
        .status(400)
        .json({ message: "Room not found" });
    }

    const quizRoom = await prisma.quizRoom.findUnique({
      where: {
        id: number_roomId,
      },
    });

    if (!quizRoom) {
      return res
        .status(400)
        .json({ message: "Quiz Room not found" });
    }

    if (quizRoom.hostId != number_id) {
      return res
        .status(403)
        .json({ message: "Only hosts are allowed to view questions" });
    }

    const questions = await prisma.questions.findMany({
      where: {
        quizRoomId: number_roomId,
      },
    });

    return res
      .status(200)
      .json({
        message: "Questions fetched successfully",
        data: questions,
      });

  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ message: "Something went wrong while fetching questions" });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const { id, roomId, questionId } = req.params;

    const number_id = Number(id);
    const number_roomId = Number(roomId);
    const number_questionId = Number(questionId);

    if (!id) {
      return res
        .status(400)
        .json({ message: "User not found" });
    }

    if (!roomId) {
      return res
        .status(400)
        .json({ message: "Room not found" });
    }

    if (!questionId) {
      return res
        .status(400)
        .json({ message: "Question ID is required" });
    }

    const quizRoom = await prisma.quizRoom.findUnique({
      where: {
        id: number_roomId,
      },
    });

    if (!quizRoom) {
      return res
        .status(400)
        .json({ message: "Quiz Room not found" });
    }

    if (quizRoom.hostId != number_id) {
      return res
        .status(403)
        .json({ message: "Only hosts are allowed to view questions" });
    }

    const question = await prisma.questions.findUnique({
      where: {
        id: number_questionId,
        quizRoomId: number_roomId,
      },
    });

    if (!question) {
      return res
        .status(404)
        .json({ message: "Question not found" });
    }

    return res
      .status(200)
      .json({
        message: "Question fetched successfully",
        data: question,
      });

  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ message: "Something went wrong while fetching the question" });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id, roomId, questionId } = req.params;
    const { question, desc, option_a, option_b, option_c, option_d, correct_option, time } = req.body;

    let Time = 45;
    if(time) Time = 45;

    const number_id = Number(id);
    const number_roomId = Number(roomId);
    const number_questionId = Number(questionId);

    if (!id) {
      return res
        .status(400)
        .json({ message: "User not found" });
    }

    if (!roomId) {
      return res
        .status(400)
        .json({ message: "Room not found" });
    }

    if (!questionId) {
      return res
        .status(400)
        .json({ message: "Question ID is required" });
    }

    const quizRoom = await prisma.quizRoom.findUnique({
      where: {
        id: number_roomId,
      },
    });

    if (!quizRoom) {
      return res
        .status(400)
        .json({ message: "Quiz Room not found" });
    }

    if (quizRoom.hostId != number_id) {
      return res
        .status(403)
        .json({ message: "Only hosts are allowed to update questions" });
    }

    const existingQuestion = await prisma.questions.findUnique({
      where: {
        id: number_questionId,
        quizRoomId: number_roomId,
      },
    });

    if (!existingQuestion) {
      return res
        .status(404)
        .json({ message: "Question not found" });
    }

    if (!question || !desc || !option_a || !option_b || !option_c || !option_d || !correct_option) {
      return res
        .status(401)
        .json({ message: "All fields are required" });
    }

    const updatedQuestion = await prisma.questions.update({
      where: {
        id: number_questionId,
      },
      data: {
        question,
        desc,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        time: Time,
      },
    });

    return res
      .status(200)
      .json({
        message: "Question updated successfully",
        data: {
          id: updatedQuestion.id,
          desc: updatedQuestion.desc,
        },
      });

  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ message: "Something went wrong while updating the question" });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id, roomId, questionId } = req.params;

    const number_id = Number(id);
    const number_roomId = Number(roomId);
    const number_questionId = Number(questionId);

    if (!id) {
      return res
        .status(400)
        .json({ message: "User not found" });
    }

    if (!roomId) {
      return res
        .status(400)
        .json({ message: "Room not found" });
    }

    if (!questionId) {
      return res
        .status(400)
        .json({ message: "Question ID is required" });
    }

    const quizRoom = await prisma.quizRoom.findUnique({
      where: {
        id: number_roomId,
      },
    });

    if (!quizRoom) {
      return res
        .status(400)
        .json({ message: "Quiz Room not found" });
    }

    if (quizRoom.hostId != number_id) {
      return res
        .status(403)
        .json({ message: "Only hosts are allowed to delete questions" });
    }

    const existingQuestion = await prisma.questions.findUnique({
      where: {
        id: number_questionId,
        quizRoomId: number_roomId,
      },
    });

    if (!existingQuestion) {
      return res
        .status(404)
        .json({ message: "Question not found" });
    }

    await prisma.questions.delete({
      where: {
        id: number_questionId,
      },
    });

    return res
      .status(200)
      .json({
        message: "Question deleted successfully",
        data: {
          id: existingQuestion.id,
          desc: existingQuestion.desc,
        },
      });

  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ message: "Something went wrong while deleting the question" });
  }
};