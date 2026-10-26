
import { Router } from "express";
import { createConversation, getConversations,getConversationMessages,  addMessage,deleteConversation} from "../controllers/conversationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();


router.use(protect);

router.post("/", createConversation);
router.get("/", getConversations);
router.get("/:conversationId/messages", getConversationMessages);
router.post("/:conversationId/messages", addMessage);
router.delete("/:conversationId", deleteConversation);

export default router;
