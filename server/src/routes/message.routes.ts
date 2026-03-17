import { Router } from "express";
import {
  createOrGetConversation,
  getConversations,
  getMessages,
  sendProfessorMessage,
  sendStudentMessage,
  shareAiMessage,
} from "../controllers/message.controller";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/conversations", protect, getConversations);
router.post("/conversations", protect, createOrGetConversation);
router.get("/:conversationId", protect, getMessages);
router.post("/:conversationId/student", protect, sendStudentMessage);
router.post("/:conversationId/professor", protect, sendProfessorMessage);
router.post("/:conversationId/share/:messageId", protect, shareAiMessage);

export default router;