import User from "../models/User.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import asyncHandler from "express-async-handler";
import {
  registerValidator,
  loginValidator,
  resetPasswordValidator,
} from "../utils/validate.js";
import { generateToken } from "../utils/generateToken.js";
import transporter from "../config/emailConfig.js";

// Register user
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const { error } = registerValidator(req.body);

  if (error) return res.status(400).json({ message: error.message });

  const user = await User.findOne({ email: email });

  if (user) {
    return res.status(400).json({ message: "User already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  generateToken(res, newUser._id);

  res.status(201).json({
    message: "User created successfully",
    success: true,
    errors: null,
    data: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
    },
  });
});

// Login user
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { error } = loginValidator(req.body);

  if (error) return res.status(400).json({ message: error.message });

  const loggedInUser = await User.findOne({ email });

  if (!loggedInUser)
    return res.status(403).json({ message: "Invalid Credentials!!!" });

  const matchedPassword = await bcrypt.compare(password, loggedInUser.password);

  if (!matchedPassword)
    return res.status(403).json({ message: "Invalid Credentials!!!" });

  generateToken(res, loggedInUser._id);
  // const refreshToken = jwt.sign(
  //   { id: loggedInUser._id },
  //   process.env.JWT_REFRESH,
  //   {
  //     expiresIn: "1h",
  //   }
  // );

  // res.cookie("is_Login", true, {
  //   httpOnly: false,
  //   secure: true,
  //   sameSite: "None",
  //   maxAge: 60 * 60 * 1000,
  // });

  res.json({
    message: "Logged in successfully!!!",
    data: {
      _id: loggedInUser._id,
      name: loggedInUser.name,
      email: loggedInUser.email,
      isAdmin: loggedInUser.isAdmin,
    },
  });
});

// Logout User
export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("jwt");

  res.json({ success: true, errors: null, message: "Logged out successfully" });
});

// export const refreshToken = (req, res, next) => {
//   const cookies = req.headers.cookie;

//   const tokenCookies = cookies.split("; ")[0];

//   const refreshToken = tokenCookies.split("=")[1];

//   if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

//   jwt.verify(refreshToken, process.env.JWT_REFRESH, async (err, decoded) => {
//     if (err)
//       return res.status(403).json({ message: "Forbidden", error: err.message });

//     const accessToken = jwt.sign(
//       {
//         id: decoded.id,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "30s" }
//     );

//     res.cookie("is_Login", true, {
//       httpOnly: false,
//       secure: true,
//       sameSite: "None",
//       maxAge: 60 * 60 * 1000,
//     });

//     res.json({ accessToken });
//   });
// };

// Get user profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    res
      .status(404)
      .json({ success: false, errors: true, message: "User Not Found" });
  }

  res.json({
    success: true,
    errors: null,
    message: "User fetched successfully",
    data: user,
  });
});

// Get All Users
export const getUsers = asyncHandler(async (req, res) => {
  const pageNumber = parseInt(req.query.pageNumber) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const hasPagination = req.query.hasPagination === "true";

  const users = await User.find({})
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .sort({ createdAt: -1 })
    .select("-password");

  const totalRecords = await User.find({}).countDocuments();

  if (!users)
    return res
      .status(404)
      .json({ success: false, errors: true, message: "No Users Found" });

  if (!hasPagination) {
    return res.json({
      success: true,
      errors: null,
      message: "Users fetched successfully",
      data: users,
    });
  } else {
    return res.json({
      pageNumber,
      pageSize,
      totalRecords,
      success: true,
      errors: null,
      message: "Users fetched successfully",
      data: users,
    });
  }
});

//Update user By Id
export const updateUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { name, email, isAdmin } = req.body;

  if (!userId)
    return res
      .status(404)
      .json({ success: false, errors: true, message: "UserId not found" });

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { _id: userId, name, email, isAdmin },
    { new: true }
  );

  if (!updatedUser)
    return res
      .status(400)
      .json({ success: false, errors: true, message: "User update failed" });

  res.json({
    success: true,
    errors: null,
    message: "User updated successfully",
  });
});

// Reset password by Admin
export const resetPasswordByAdmin = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      errors: true,
      message: "No email provided",
    });
  }
  const user = await User.findOne({ email: email });

  if (!user)
    return res
      .status(404)
      .json({ success: false, errors: true, message: "User not found" });

  const resetPassword = `${user.name.split(" ")[0]}@123`;

  const salt = await bcrypt.genSalt(10);

  const hashed = await bcrypt.hash(resetPassword, salt);

  await User.findOneAndUpdate({ email }, { password: hashed }, { new: true });

  res.json({
    success: true,
    errors: null,
    message: "Password reset successfully",
  });
});

// Send email for password reset
export const sendEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(404).json({
      success: false,
      errors: true,
      message: "Please provide your email address.",
    });
  }

  const user = await User.findOne({ email });

  if (!user)
    return res.status(404).json({
      success: false,
      errors: true,
      message: "User does not exist. Please provide valid email address.",
    });

  // Generate unique token with expiration time
  const token = crypto.randomBytes(32).toString("hex");
  const expirationTime = Date.now() + 30 * 60 * 1000;

  await User.findOneAndUpdate(
    { email },
    { resetToken: token, resetTokenExpiration: new Date(expirationTime) },
    { new: true }
  );

  // Create reset link
  const resetLink = `${
    process.env.NODE_ENV === "development"
      ? process.env.LOCAL_DOMAIN_URL
      : process.env.DOMAIN_URL
  }/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: email,
    subject: "Password reset",
    html: `<p>Hi there,</p><p>Click on the link below to reset your password.</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link will expire in 30 minutes. If you did not request for password reset,<br />you can safely ignore this email.</p><p>Best Regards,</p><p>Taskoo Team</p>`,
  };

  await transporter.sendMail(mailOptions);

  res.json({
    success: true,
    errors: null,
    message: "Password reset email sent successfully",
    data: resetLink,
  });
});

// Get token and email of user from mail link to reset password
export const getTokenToResetPassword = asyncHandler(async (req, res) => {
  const { token } = req.query;

  // Find the user by reset token and validate the token and its expiration time
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      errors: true,
      message:
        "The link sent to your email has been expired! Please try again.",
    }); // Display an expired or invalid link message
  }

  // Token is valid, render the password reset page
  res.json({
    success: true,
    errors: null,
    message: "Token retrieved successfully",
    data: { token, email: user.email },
  });
});

// Forgot password and Reset password by user
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  // if (!token) {
  //   return res.status(400).json({
  //     success: false,
  //     errors: true,
  //     message: "No token provided!",
  //   });
  // }

  const { error } = resetPasswordValidator(req.body);

  if (error) return res.status(400).json({ message: error.message });

  const user = await User.findOne({ resetToken: token });

  if (!user)
    return res
      .status(404)
      .json({ success: false, errors: true, message: "User not found" });

  const matchedPassword = await bcrypt.compare(newPassword, user.password);

  if (matchedPassword)
    return res.status(400).json({
      success: false,
      errors: true,
      message: "Password must be different from previous password!",
    });

  const salt = await bcrypt.genSalt(10);

  const hashed = await bcrypt.hash(newPassword, salt);

  await User.findOneAndUpdate(
    { resetToken: token },
    { password: hashed },
    { new: true }
  );

  res.json({
    success: true,
    errors: null,
    message: "Password reset successfully",
    data: user,
  });
});
