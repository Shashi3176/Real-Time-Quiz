import jwt from 'jsonwebtoken';
import {prisma} from '../services/prisma.services.js';

export const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.auth_token;

        if(!token){
            return res
            .status(401)
            .json({message: "User unauthorized"})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.users.findUnique({
            where: {id: decoded.userId}
        })

        if(!user){
            return res
            .status(400)
            .json({message: "User not found"})
        }

        req.user = user;
        next();

    } catch (error) {
        return res
        .status(500)
        .json({message: "Something went wrong while verifying cookie"});
    }
}