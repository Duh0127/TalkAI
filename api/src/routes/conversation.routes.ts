import { Router } from "express";
import { ConversationController } from "../controllers/conversation.controller";

export const routeAlias = "/conversation";

const router = Router();
const controller = new ConversationController();

router.get("/", controller.list.bind(controller));
router.get("/:id", controller.getById.bind(controller));

router.post("/", controller.create.bind(controller));
router.patch("/:id", controller.update.bind(controller));
router.delete("/:id", controller.softDelete.bind(controller));

router.patch("/:id/restore", controller.restore.bind(controller));

// listar ativas
// router.get("/active", controller.listActive.bind(controller));

// buscar com mensagens
// router.get("/:id/messages", controller.getByIdWithMessages.bind(controller));

export default router;
