import { Request, Response } from "express";
import { ConversationService } from "../services/conversation.service";
import { AppError } from "../errors/AppError";
import { HttpResponse } from "../utils/http-response";
import {
    serializeConversation,
    serializeConversationList,
    serializeConversationWithMessages,
} from "../utils/response-serializers";

export class ConversationController {
    private readonly service: ConversationService;

    constructor() {
        this.service = new ConversationService();
    }

    /**
     * Cria uma nova conversa.
     */
    async create(req: Request, res: Response): Promise<Response> {
        try {
            const created = await this.service.create(req.body);
            return HttpResponse.created(res, serializeConversation(created), "Conversa criada");
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    /**
     * Lista todas as conversas.
     */
    async list(req: Request, res: Response): Promise<Response> {
        try {
            const conversations = await this.service.list();
            return HttpResponse.ok(res, serializeConversationList(conversations), "Conversas recuperadas");
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    /**
     * Obtém uma conversa pelo ID.
     */
    async getById(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const conversation = await this.service.getById(id);
            return HttpResponse.ok(res, serializeConversation(conversation), "Conversa recuperada");
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    /**
     * Atualiza uma conversa existente.
     */
    async update(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const updated = await this.service.update(id, req.body);
            return HttpResponse.ok(res, serializeConversation(updated), "Conversa atualizada");
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    /**
     * Soft delete: marca uma conversa como deletada.
     */
    async softDelete(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const deleted = await this.service.softDelete(id);
            return HttpResponse.ok(res, serializeConversation(deleted), "Conversa removida");
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    /**
     * Restaura uma conversa previamente deletada.
     */
    async restore(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const restored = await this.service.restore(id);
            return HttpResponse.ok(res, serializeConversation(restored), "Conversa restaurada");
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    /**
     * Lista conversas ativas (del=false)
     */
    async listActive(req: Request, res: Response): Promise<Response> {
        try {
            const conversations = await this.service.listActive();
            return HttpResponse.ok(
                res,
                serializeConversationList(conversations),
                "Conversas ativas recuperadas"
            );
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    /**
     * Obtém conversa com mensagens
     */
    async getByIdWithMessages(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const conversation = await this.service.getByIdWithMessages(id);
            return HttpResponse.ok(
                res,
                serializeConversationWithMessages(conversation),
                "Conversa e mensagens recuperadas"
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
