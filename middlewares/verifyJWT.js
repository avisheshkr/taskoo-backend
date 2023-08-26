import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyJWT = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token)
    return res.status(401).json({ message: "Not Authorized, no token found" });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Forbidden" });

    const user = await User.findById(decoded.userId).select("-password");

    req.user = user;
    next();
  });
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  } else {
    res.status(401).json({ message: "Not Authorized as Admin" });
  }
};
