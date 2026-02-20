import { Message } from "../models/message.model";
import { CreateMessageDTO } from "../dtos/message/create-message-dto";
import { UpdateMessageDTO } from "../dtos/message/update-message-dto";
import { Op } from "sequelize";

/**
 * Repositório responsável por operações de persistência relacionadas ao modelo Message.
 * Mantém uma interface clara e isolada para o banco de dados.
 */
export class MessageRepository {
    /**
     * Cria uma nova mensagem.
     * @param payload Dados para criação da mensagem.
     * @returns A mensagem criada.
     */
    static async create(payload: CreateMessageDTO): Promise<Message> {
        return Message.create(payload);
    }

    /**
     * Lista todas as mensagens.
     * @returns Lista de mensagens.
     */
    static async list(): Promise<Message[]> {
        return Message.findAll();
    }

    /**
     * Lista todas as mensagens associadas a uma conversa.
     * @param conversationId ID da conversa.
     * @returns Lista de mensagens vinculadas.
     */
    static async listByConversation(
        conversationId: number,
        includeDeleted = false
    ): Promise<Message[]> {
        return Message.findAll({
            where: includeDeleted ? { conversationId } : { conversationId, del: false },
            order: [["id", "ASC"]],
        });
    }

    /**
     * Busca uma mensagem pelo ID.
     * @param id ID da mensagem.
     * @returns Mensagem encontrada ou null.
     */
    static async getById(id: number): Promise<Message | null> {
        return Message.findByPk(id);
    }

    /**
     * Atualiza uma mensagem existente.
     * @param id ID da mensagem.
     * @param payload Dados para atualização.
     * @returns A mensagem atualizada ou null se não existir.
     */
    static async update(id: number, payload: UpdateMessageDTO): Promise<Message | null> {
        const message = await Message.findByPk(id);
        if (!message) return null;

        return message.update(payload);
    }

    /**
     * Soft delete: marca a mensagem como deletada.
     * @param id ID da mensagem.
     * @returns A mensagem deletada ou null.
     */
    static async softDelete(id: number): Promise<Message | null> {
        const message = await Message.findByPk(id);
        if (!message) return null;

        await message.update({ del: true });
        return message;
    }

    /**
     * Restaura uma mensagem deletada (soft delete).
     * @param id ID da mensagem.
     * @returns A mensagem restaurada ou null.
     */
    static async restore(id: number): Promise<Message | null> {
        const message = await Message.findByPk(id);
        if (!message) return null;

        await message.update({ del: false });
        return message;
    }

    /**
     * Soft delete em lote: marca todas as mensagens de uma conversa como deletadas.
     * @param conversationId ID da conversa.
     * @returns Quantidade de mensagens afetadas.
     */
    static async softDeleteByConversation(conversationId: number): Promise<number> {
        const [affectedRows] = await Message.update(
            { del: true },
            {
                where: {
                    conversationId,
                    del: false,
                },
            }
        );

        return affectedRows;
    }

    /**
     * Soft delete em lote: marca como deletadas as mensagens posteriores a uma mensagem da conversa.
     * @param conversationId ID da conversa.
     * @param messageId ID da mensagem base.
     * @returns Quantidade de mensagens afetadas.
     */
    static async softDeleteByConversationAfterMessage(
        conversationId: number,
        messageId: number
    ): Promise<number> {
        const [affectedRows] = await Message.update(
            { del: true },
            {
                where: {
                    conversationId,
                    del: false,
                    id: {
                        [Op.gt]: messageId,
                    },
                },
            }
        );

        return affectedRows;
    }
}
