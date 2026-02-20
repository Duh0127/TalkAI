import { ConversationRepository } from "../repositories/conversation.repository";
import { CreateConversationDTO } from "../dtos/conversation/create-conversation-dto";
import { UpdateConversationDTO } from "../dtos/conversation/update-conversation-dto";
import { ErrorTypes } from "../errors/ErrorTypes";
import { Conversation } from "../models/conversation.model";
import { openAIService } from "./openai.service";

export class ConversationService {
    /**
     * Cria uma nova conversa.
     * @param payload Dados para criacao.
     */
    async create(payload: CreateConversationDTO) {
        if (!payload?.name) {
            throw ErrorTypes.MissingFields("name e obrigatorio");
        }

        return ConversationRepository.create(payload);
    }

    /**
     * Obtem todas as conversas.
     */
    async list() {
        return ConversationRepository.list();
    }

    /**
     * Obtem todas as conversas ativas (del=false).
     */
    async listActive() {
        return ConversationRepository.listActive();
    }

    /**
     * Obtem uma conversa pelo ID.
     * @param id ID da conversa.
     */
    async getById(id: number) {
        if (!id) throw ErrorTypes.MissingFields("ID e obrigatorio");

        const conversation = await ConversationRepository.getById(id);
        if (!conversation) throw ErrorTypes.NotFound("Conversa nao encontrada");

        return conversation;
    }

    /**
     * Obtem uma conversa pelo ID com as mensagens.
     * @param id ID da conversa.
     */
    async getByIdWithMessages(id: number) {
        if (!id) throw ErrorTypes.MissingFields("ID e obrigatorio");

        const conversation = await ConversationRepository.getByIdWithMessages(id);
        if (!conversation) throw ErrorTypes.NotFound("Conversa nao encontrada");

        return conversation;
    }

    /**
     * Cria uma nova conversa com nome gerado por IA.
     */
    async createConversationAI(prompt: string): Promise<Conversation> {
        const generatedName = await this.generateConversationName(prompt);

        return ConversationRepository.create({
            name: generatedName,
        });
    }

    /**
     * Gera um nome de conversa a partir da primeira mensagem.
     */
    async generateConversationName(prompt: string): Promise<string> {
        const fallbackName = this.buildFallbackConversationName(prompt);

        const compactPrompt = prompt.trim().replace(/\s+/g, " ");
        if (!compactPrompt) return fallbackName;

        try {
            const response = await openAIService.createConversationTitleResponse(compactPrompt);
            const rawTitle = openAIService.extractOutputText(response);
            const normalizedTitle = String(rawTitle ?? "")
                .replace(/["'`]/g, "")
                .replace(/\s+/g, " ")
                .trim();

            if (!normalizedTitle) return fallbackName;

            return normalizedTitle.length > 60 ? `${normalizedTitle.slice(0, 57)}...` : normalizedTitle;
        } catch (_error) {
            return fallbackName;
        }
    }

    /**
     * Atualiza uma conversa existente.
     * @param id ID da conversa.
     * @param payload Dados para atualizacao.
     */
    async update(id: number, payload: UpdateConversationDTO) {
        if (!id) throw ErrorTypes.MissingFields("ID e obrigatorio");

        // Validacoes opcionais: so valida se veio no payload.
        if (payload.name !== undefined && !payload.name) {
            throw ErrorTypes.MissingFields("name nao pode ser vazio");
        }

        const updated = await ConversationRepository.update(id, payload);
        if (!updated) throw ErrorTypes.NotFound("Conversa nao encontrada");

        return updated;
    }

    /**
     * Soft delete: marca uma conversa como deletada.
     * @param id ID da conversa.
     */
    async softDelete(id: number) {
        if (!id) throw ErrorTypes.MissingFields("ID e obrigatorio");

        const deleted = await ConversationRepository.softDelete(id);
        if (!deleted) throw ErrorTypes.NotFound("Conversa nao encontrada");

        return deleted;
    }

    /**
     * Restaura uma conversa previamente deletada (soft delete).
     * @param id ID da conversa.
     */
    async restore(id: number) {
        if (!id) throw ErrorTypes.MissingFields("ID e obrigatorio");

        const restored = await ConversationRepository.restore(id);
        if (!restored) throw ErrorTypes.NotFound("Conversa nao encontrada");

        return restored;
    }

    private buildFallbackConversationName(prompt: string): string {
        const compactPrompt = prompt.trim().replace(/\s+/g, " ");
        if (!compactPrompt) return "Nova conversa";

        const firstSentence = compactPrompt
            .split(/[.!?]+/)
            .map((chunk) => chunk.trim())
            .find((chunk) => chunk.length > 0);

        const baseName = firstSentence ?? compactPrompt;
        const limitedWords = baseName
            .split(" ")
            .filter(Boolean)
            .slice(0, 12)
            .join(" ");

        const normalizedName = limitedWords || baseName;
        return normalizedName.length > 60 ? `${normalizedName.slice(0, 57)}...` : normalizedName;
    }
}
