import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../services/prisma.services.js"; 

const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });

    res.cookie("jwt", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
    });
};

export const signup = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) return res.status(400).json({ error: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await prisma.user.create({
            data: { email, username, password: hashedPassword }
        });

        generateTokenAndSetCookie(newUser.id, res);
        res.status(201).json({ id: newUser.id, username: newUser.username });
    } catch (error) {
        res.status(500).json({ error: "Signup failed" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
        });

    
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        generateTokenAndSetCookie(user.id, res);

        res.status(200).json({
            id: user.id,
            username: user.username,
            email: user.email,
        });
    } catch (error) {
        console.error("Error in login controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Error in logout controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};