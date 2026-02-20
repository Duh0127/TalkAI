import { Request, Response } from "express";
import { MessageService } from "../services/message.service";
import { AppError } from "../errors/AppError";
import { HttpResponse } from "../utils/http-response";
import {
    serializeClearConversationResponse,
    serializeMessage,
    serializeMessageList,
} from "../utils/response-serializers";

export class MessageController {
    private readonly service: MessageService;

    constructor() {
        this.service = new MessageService();
    }

    /**
     * Cria uma nova mensagem.
     */
    async create(req: Request, res: Response): Promise<Response> {
        try {
            const created = await this.service.create(req.body);
            return HttpResponse.created(res, serializeMessage(created), "Mensagem criada");
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    /**
     * Lista todas as mensagens.
     */
    async list(req: Request, res: Response): Promise<Response> {
        try {
            const messages = await this.service.list();
            return HttpResponse.ok(res, serializeMessageList(messages), "Mensagens recuperadas");
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    /**
     * Obtém uma mensagem pelo ID.
     */
    async getById(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const message = await this.service.getById(id);
            return HttpResponse.ok(res, serializeMessage(message), "Mensagem recuperada");
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    /**
     * Lista todas as mensagens de uma conversa.
     * Exemplo de rota: GET /messages/conversation/:conversationId
     */
    async listByConversation(req: Request, res: Response): Promise<Response> {
        try {
            const conversationId = Number(req.params.conversationId);
            const messages = await this.service.listByConversation(conversationId);
            return HttpResponse.ok(
                res,
                serializeMessageList(messages),
                "Mensagens da conversa recuperadas"
            );
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    /**
     * Atualiza uma mensagem existente.
     */
    async update(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const updated = await this.service.update(id, req.body);
            return HttpResponse.ok(res, serializeMessage(updated), "Mensagem atualizada");
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    /**
     * Soft delete: marca uma mensagem como deletada.
     */
    async softDelete(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const deleted = await this.service.softDelete(id);
            return HttpResponse.ok(res, serializeMessage(deleted), "Mensagem removida");
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    /**
     * Restaura uma mensagem previamente deletada.
     */
    async restore(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const restored = await this.service.restore(id);
            return HttpResponse.ok(res, serializeMessage(restored), "Mensagem restaurada");
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    /**
     * Soft delete em lote das mensagens de uma conversa.
     */
    async clearConversation(req: Request, res: Response): Promise<Response> {
        try {
            const conversationId = Number(req.params.conversationId);
            const result = await this.service.clearConversation(conversationId);
            return HttpResponse.ok(
                res,
                serializeClearConversationResponse(result),
                "Conversa limpa"
            );
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    /**
     * Tratamento centralizado de erros.
     */
    private handleError(error: unknown, res: Response): Response {
        if (error instanceof AppError) {
            return HttpResponse.handleAppError(res, error);
        }

        return HttpResponse.handleUnknownError(res, error);
    }
}
