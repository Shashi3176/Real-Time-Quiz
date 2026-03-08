import {prisma} from "../services/prisma.services.js"; 
import { generateToken } from "../services/jwt.services.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if(!username || !email || !password || !confirmPassword){
      return res
      .status(400)
      .json({message: "All fields are required"})
    };

    if (password !== confirmPassword) {
      return res
      .status(400)
      .json({ message: "Passwords do not match" });
    }

    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const token = generateToken(newUser.id);

    res.cookie("auth_token", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: false,
    });

    return res.status(201).json({
      message: "User signed up successfully",
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      },
    });
  } catch (error) {
    res
    .status(500)
    .json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if(!email || !password){
      return res
      .status(400)
      .json({message: "All fields are required"})
    };

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res
      .status(401)
      .json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res
      .status(401)
      .json({ message: "Invalid email or password" });
    }

    const token = generateToken(user.id);

    res.cookie("auth_token", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: false,
    });

    res.status(200).json({
      message: "Login successful",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res
    .status(500)
    .json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  try {   
    res.clearCookie("auth_token");

    res
    .status(200)
    .json({ message: "Logged out successfully" });
  } catch (error) {
    res
    .status(500)
    .json({ message: "Internal Server Error" });
  }
};