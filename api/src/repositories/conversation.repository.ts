import { Conversation } from "../models/conversation.model";
import { Message } from "../models/message.model";
import { CreateConversationDTO } from "../dtos/conversation/create-conversation-dto";
import { UpdateConversationDTO } from "../dtos/conversation/update-conversation-dto";

/**
 * Repositório responsável por operações de persistência relacionadas ao modelo Conversation.
 * Mantém uma interface clara e isolada para o banco de dados.
 */
export class ConversationRepository {
    /**
     * Cria uma nova conversa.
     * @param payload Dados para criação.
     * @returns A conversa criada.
     */
    static async create(payload: CreateConversationDTO): Promise<Conversation> {
        return Conversation.create(payload);
    }

    /**
     * Lista todas as conversas não excluídas.
     * @returns Lista de conversas não excluídas.
     */
    static async list(): Promise<Conversation[]> {
        return Conversation.findAll({
            where: { del: false },
            order: [["createdAt", "DESC"]],
        });
    }

    /**
     * Lista todas as conversas que NÃO estão deletadas (del=false).
     * @returns Lista de conversas ativas.
     */
    static async listActive(): Promise<Conversation[]> {
        return Conversation.findAll({ where: { del: false } });
    }

    /**
     * Busca uma conversa pelo ID.
     * @param id ID da conversa.
     * @returns Conversa encontrada ou null.
     */
    static async getById(id: number): Promise<Conversation | null> {
        return Conversation.findByPk(id);
    }

    /**
     * Busca uma conversa pelo ID trazendo as mensagens.
     */
    static async getByIdWithMessages(id: number): Promise<Conversation | null> {
        return Conversation.findByPk(id, {
            include: [{ model: Message, as: "messages" }],
        });
    }

    /**
     * Atualiza uma conversa existente.
     * @param id ID da conversa.
     * @param payload Dados para atualização.
     * @returns A conversa atualizada ou null se não existir.
     */
    static async update(
        id: number,
        payload: UpdateConversationDTO
    ): Promise<Conversation | null> {
        const conversation = await Conversation.findByPk(id);
        if (!conversation) return null;

        return conversation.update(payload);
    }

    /**
     * Soft delete: marca a conversa como deletada.
     * @param id ID da conversa.
     * @returns A conversa deletada ou null.
     */
    static async softDelete(id: number): Promise<Conversation | null> {
        const conversation = await Conversation.findByPk(id);
        if (!conversation) return null;

        await conversation.update({ del: true });
        return conversation;
    }

    /**
     * Restaura uma conversa deletada (soft delete).
     * @param id ID da conversa.
     * @returns A conversa restaurada ou null.
     */
    static async restore(id: number): Promise<Conversation | null> {
        const conversation = await Conversation.findByPk(id);
        if (!conversation) return null;

        await conversation.update({ del: false });
        return conversation;
    }
}
