import { MessageRepository } from "../repositories/message.repository";
import { ConversationRepository } from "../repositories/conversation.repository";
import { CreateMessageDTO } from "../dtos/message/create-message-dto";
import { UpdateMessageDTO } from "../dtos/message/update-message-dto";
import { ErrorTypes } from "../errors/ErrorTypes";

export class MessageService {
    /**
     * Cria uma nova mensagem associada a uma conversa.
     * @param payload Dados para criacao.
     */
    async create(payload: CreateMessageDTO) {
        if (!payload.conversationId) {
            throw ErrorTypes.MissingFields("conversationId e obrigatorio");
        }

        if (!payload.role) {
            throw ErrorTypes.MissingFields("role e obrigatorio");
        }

        if (!payload.content) {
            throw ErrorTypes.MissingFields("content e obrigatorio");
        }

        if (!payload.date) {
            throw ErrorTypes.MissingFields("date e obrigatorio");
        }

        return MessageRepository.create(payload);
    }

    /**
     * Obtem todas as mensagens.
     */
    async list() {
        return MessageRepository.list();
    }

    /**
     * Obtem uma mensagem pelo ID.
     * @param id ID da mensagem.
     */
    async getById(id: number) {
        if (!id) throw ErrorTypes.MissingFields("ID e obrigatorio");

        const message = await MessageRepository.getById(id);
        if (!message) throw ErrorTypes.NotFound("Mensagem nao encontrada");

        return message;
    }

    /**
     * Lista mensagens ativas de uma conversa.
     * @param conversationId ID da conversa.
     */
    async listByConversation(conversationId: number) {
        if (!conversationId) {
            throw ErrorTypes.MissingFields("conversationId e obrigatorio");
        }

        return MessageRepository.listByConversation(conversationId);
    }

    /**
     * Atualiza uma mensagem existente.
     * @param id ID da mensagem.
     * @param payload Dados para atualizacao.
     */
    async update(id: number, payload: UpdateMessageDTO) {
        if (!id) throw ErrorTypes.MissingFields("ID e obrigatorio");

        if (payload.role !== undefined && !payload.role) {
            throw ErrorTypes.MissingFields("role nao pode ser vazio");
        }

        if (payload.content !== undefined && !payload.content) {
            throw ErrorTypes.MissingFields("content nao pode ser vazio");
        }

        if (payload.date !== undefined && !payload.date) {
            throw ErrorTypes.MissingFields("date nao pode ser vazio");
        }

        const updated = await MessageRepository.update(id, payload);
        if (!updated) throw ErrorTypes.NotFound("Mensagem nao encontrada");

        return updated;
    }

    /**
     * Realiza soft delete em uma mensagem.
     * @param id ID da mensagem.
     */
    async softDelete(id: number) {
        if (!id) throw ErrorTypes.MissingFields("ID e obrigatorio");

        const deleted = await MessageRepository.softDelete(id);
        if (!deleted) throw ErrorTypes.NotFound("Mensagem nao encontrada");

        return deleted;
    }

    /**
     * Restaura uma mensagem previamente deletada.
     * @param id ID da mensagem.
     */
    async restore(id: number) {
        if (!id) throw ErrorTypes.MissingFields("ID e obrigatorio");

        const restored = await MessageRepository.restore(id);
        if (!restored) throw ErrorTypes.NotFound("Mensagem nao encontrada");

        return restored;
    }

    /**
     * Limpa uma conversa marcando todas as mensagens como del=true.
     * @param conversationId ID da conversa.
     */
    async clearConversation(conversationId: number) {
        if (!conversationId) {
            throw ErrorTypes.MissingFields("conversationId e obrigatorio");
        }

        const conversation = await ConversationRepository.getById(conversationId);
        if (!conversation || conversation.del) {
            throw ErrorTypes.NotFound("Conversa nao encontrada");
        }

        const clearedCount = await MessageRepository.softDeleteByConversation(conversationId);
        await conversation.update({ updatedAt: new Date() } as any);

        return {
            conversationId,
            clearedCount,
        };
    }
}
