import { Router } from "express";
import { ChatBotController } from "../controllers/chatbot.controller";

export const routeAlias = "/chatbot";

const router = Router();
const controller = new ChatBotController();

router.post("/", controller.sendMessage.bind(controller));

export default router;
