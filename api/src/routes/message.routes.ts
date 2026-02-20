import { Router } from "express";
import { MessageController } from "../controllers/message.controller";

export const routeAlias = "/message";

const router = Router();
const controller = new MessageController();

router.get("/", controller.list.bind(controller));
router.get("/conversation/:conversationId", controller.listByConversation.bind(controller));

router.get("/:id", controller.getById.bind(controller));
router.post("/", controller.create.bind(controller));
router.patch("/:id", controller.update.bind(controller));
router.delete("/:id", controller.softDelete.bind(controller));
router.patch("/:id/restore", controller.restore.bind(controller));
router.patch("/conversation/:conversationId/clear", controller.clearConversation.bind(controller));

export default router;
