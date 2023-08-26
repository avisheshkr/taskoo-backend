import express from "express";
import {
  getTokenToResetPassword,
  getUserProfile,
  getUsers,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  resetPasswordByAdmin,
  sendEmail,
  updateUserById,
} from "../controllers/userController.js";
import { isAdmin, verifyJWT } from "../middlewares/verifyJWT.js";

const router = express.Router();

// Register User
router.post("/register", registerUser);

//Login User
router.post("/login", loginUser);

// Logout User
router.post("/logout", logoutUser);

// Get User with email
router.post("/send-email", sendEmail);

// Get Token and Verify Token and expiration time
router.get("/reset-token", getTokenToResetPassword);

// Get logged in User Profile
router.get("/profile", verifyJWT, getUserProfile);

// Get all Users by Admin
router.get("/", verifyJWT, isAdmin, getUsers);

// Reset Password by User
router.put("/forgot-password", resetPassword);

// Reset Password by Admin
router.put("/reset-password", verifyJWT, isAdmin, resetPasswordByAdmin);

// Update User by Admin
router.put("/:id", verifyJWT, isAdmin, updateUserById);

export default router;
