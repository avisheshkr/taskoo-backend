import express from "express";
import {
  createTask,
  deleteTask,
  getTask,
  getUserTasks,
  updateTask,
} from "../controllers/taskController.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/").post(createTask).get(getUserTasks);
router.route("/:id").get(getTask).put(updateTask).delete(deleteTask);

export default router;
