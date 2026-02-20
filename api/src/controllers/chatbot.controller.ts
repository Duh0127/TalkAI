import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { Request, Response } from "express";
import { ConversationService } from "../services/conversation.service";
import { MessageRepository } from "../repositories/message.repository";
import { ErrorTypes } from "../errors/ErrorTypes";
import { AppError } from "../errors/AppError";
import { HttpResponse } from "../utils/http-response";
import { openAIService } from "../services/openai.service";
import { EventStream } from "../utils/EventStream";

type StoredChatFile = {
    name: string;
    url: string;
};

type UploadedChatFile = StoredChatFile & {
    mimeType: string;
    filePath: string;
};

type UserInputPart =
    | {
        type: "input_text";
        text: string;
    }
    | {
        type: "input_image";
        image_url: string;
        detail: "auto";
    }
    | {
        type: "input_file";
        filename: string;
        file_data?: string;
    };

type ResponseInputMessage = {
    role: "user" | "assistant";
    content: string | UserInputPart[];
};

const MAX_CHATBOT_FILES = 8;
const MAX_CHATBOT_FILE_SIZE_MB = 15;
const MAX_CHATBOT_FILE_SIZE_BYTES = MAX_CHATBOT_FILE_SIZE_MB * 1024 * 1024;

const CHATBOT_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "chatbot");

const ALLOWED_MIMES = new Set([
    "application/pdf",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

const ALLOWED_EXTENSIONS = new Set([".pdf", ".txt", ".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const MIME_EXTENSION_FALLBACK: Record<string, string> = {
    "application/pdf": ".pdf",
    "text/plain": ".txt",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
};

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const MAX_MESSAGE_CONTENT_CHARS = 3900;

function ensureChatbotUploadDir() {
    fs.mkdirSync(CHATBOT_UPLOAD_DIR, { recursive: true });
}

function sanitizeFileBaseName(fileName: string): string {
    const cleaned = fileName
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");

    return cleaned.slice(0, 60) || "file";
}

function generateFileId(): string {
    if (crypto.randomUUID) return crypto.randomUUID();
    return crypto.randomBytes(16).toString("hex");
}

function getFileExtension(originalName: string, mimeType: string): string {
    const extension = path.extname(originalName || "").toLowerCase();
    if (ALLOWED_EXTENSIONS.has(extension)) return extension;
    return MIME_EXTENSION_FALLBACK[mimeType] ?? "";
}

function parseConversationId(value: unknown): number | null {
    if (value === undefined || value === null || value === "") return null;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return parsed;
}

function parseMessageId(value: unknown): number | null {
    return parseConversationId(value);
}

function truncateMessageContent(content: string): string {
    if (content.length <= MAX_MESSAGE_CONTENT_CHARS) return content;
    return `${content.slice(0, MAX_MESSAGE_CONTENT_CHARS - 3)}...`;
}

function normalizeStoredFiles(value: unknown): StoredChatFile[] {
    if (!Array.isArray(value)) return [];

    return value
        .map((item) => {
            const name = String((item as { name?: unknown })?.name ?? "").trim();
            const url = String((item as { url?: unknown })?.url ?? "").trim();

            if (!name || !url) return null;
            return { name, url };
        })
        .filter((item): item is StoredChatFile => Boolean(item));
}

export class ChatBotController {
    private readonly conversationService = new ConversationService();

    private readonly uploader = multer({
        storage: multer.diskStorage({
            destination: (_req, _file, cb) => {
                try {
                    ensureChatbotUploadDir();
                    cb(null, CHATBOT_UPLOAD_DIR);
                } catch (error) {
                    cb(error as Error, CHATBOT_UPLOAD_DIR);
                }
            },
            filename: (_req, file, cb) => {
                try {
                    const ext = getFileExtension(file.originalname, file.mimetype);
                    if (!ext) {
                        cb(new AppError("Extensao de arquivo nao suportada.", 400, "INVALID_FILE_EXTENSION"), "");
                        return;
                    }

                    const base = sanitizeFileBaseName(path.parse(file.originalname).name);
                    const safeName = `${Date.now()}_${generateFileId()}_${base}${ext}`;
                    cb(null, safeName);
                } catch (error) {
                    cb(error as Error, "");
                }
            },
        }),
        fileFilter: (_req, file, cb) => {
            const extension = path.extname(file.originalname || "").toLowerCase();
            const mimeAllowed = ALLOWED_MIMES.has(file.mimetype);
            const extensionAllowed = extension ? ALLOWED_EXTENSIONS.has(extension) : false;

            if (!mimeAllowed && !extensionAllowed) {
                cb(new AppError(`Tipo de arquivo nao permitido (${file.mimetype}).`, 400, "INVALID_FILE_TYPE"));
                return;
            }

            if (extension && !extensionAllowed) {
                cb(new AppError(`Extensao de arquivo nao permitida (${extension}).`, 400, "INVALID_FILE_EXTENSION"));
                return;
            }

            cb(null, true);
        },
        limits: {
            files: MAX_CHATBOT_FILES,
            fileSize: MAX_CHATBOT_FILE_SIZE_BYTES,
            fields: 40,
            fieldSize: 2 * 1024 * 1024,
        },
    });

    async sendMessage(req: Request, res: Response): Promise<Response> {
        let eventStream: EventStream | null = null;

        try {
            await this.handleMultipart(req, res);
            eventStream = EventStream.from(req, res);

            const prompt = String(req.body.prompt ?? req.body.content ?? "").trim();
            const uploadedFiles = this.mapUploadedFiles(req);
            const conversationId = parseConversationId(req.body.conversationId ?? req.body.conversation_id);
            const editingMessageId = parseMessageId(
                req.body.editingMessageId ?? req.body.editing_message_id ?? req.body.editedMessageId
            );

            if (!prompt) {
                throw ErrorTypes.MissingFields("O prompt é obrigatorio");
            }

            if (editingMessageId && uploadedFiles.length > 0) {
                throw ErrorTypes.BadRequest("Na edicao, os arquivos nao podem ser editados.");
            }

            if (editingMessageId && !conversationId) {
                throw ErrorTypes.MissingFields("conversationId e obrigatorio para edicao.");
            }

            const conversation = conversationId
                ? await this.conversationService.getById(conversationId)
                : await this.conversationService.createConversationAI(prompt);

            if (conversation.del) {
                throw ErrorTypes.NotFound("Conversa nao encontrada");
            }

            if (!conversationId) {
                eventStream?.sendEvent({
                    type: "conversation-name",
                    content: {
                        id: conversation.id,
                        name: conversation.name,
                    },
                });
            }

            const userContent = truncateMessageContent(prompt);

            const userMessage = await this.persistUserMessage({
                conversationId: conversation.id,
                userContent,
                uploadedFiles,
                editingMessageId,
            });

            const history = await MessageRepository.listByConversation(conversation.id);
            const responseInput = await this.buildResponseInput(history, {
                latestUserMessageId: userMessage.id,
                latestUploadedFiles: uploadedFiles,
            });

            return this.streamRequestToOpenAI({
                res,
                eventStream,
                conversation,
                userMessage,
                responseInput,
            });
        } catch (error) {
            if (eventStream) {
                eventStream.sendEvent({
                    type: "error",
                    content: this.getErrorMessage(error),
                });
                eventStream.sendDone();
                return res;
            }

            return this.handleError(error, res);
        }
    }

    private async streamRequestToOpenAI(params: {
        res: Response;
        eventStream: EventStream;
        conversation: any;
        userMessage: any;
        responseInput: ResponseInputMessage[];
    }): Promise<Response> {
        const { res, eventStream, conversation, userMessage, responseInput } = params;

        let generatedAssistantText = "";
        const responseStream = await openAIService.createChatbotAssistantResponse(responseInput);

        for await (const event of responseStream) {
            if (event.type === "response.output_text.delta") {
                const chunk = String(event.delta ?? "");
                if (!chunk) continue;

                generatedAssistantText += chunk;
                eventStream.sendEvent({ type: "chat-stream", content: chunk });
                continue;
            }

            if (event.type === "response.output_text.done" && !generatedAssistantText) {
                generatedAssistantText = String(event.text ?? "");
                continue;
            }

            if (event.type === "error") {
                const errorMessage = String(event.message ?? "").trim();
                if (errorMessage) {
                    throw ErrorTypes.ExternalService(errorMessage);
                }
            }
        }

        const assistantContent = generatedAssistantText
            ? truncateMessageContent(generatedAssistantText)
            : "Nao consegui gerar uma resposta agora.";

        const assistantMessage = await MessageRepository.create({
            conversationId: conversation.id,
            role: "assistant",
            content: assistantContent,
            files: [],
            date: new Date().toISOString(),
        });

        await conversation.update({ updatedAt: new Date() } as any);
        eventStream.sendEvent({
            type: "message-ids",
            content: {
                userMessageId: Number(userMessage.id),
                assistantMessageId: Number(assistantMessage.id),
            },
        });
        eventStream.sendDone();
        return res;
    }

    private handleMultipart(req: Request, res: Response): Promise<void> {
        return new Promise((resolve, reject) => {
            this.uploader.array("files", MAX_CHATBOT_FILES)(req, res, (error) => {
                if (!error) {
                    resolve();
                    return;
                }

                if (error instanceof multer.MulterError) {
                    if (error.code === "LIMIT_FILE_SIZE") {
                        reject(
                            new AppError(
                                `Arquivo muito grande. Limite de ${MAX_CHATBOT_FILE_SIZE_MB}MB por arquivo.`,
                                413,
                                "FILE_TOO_LARGE"
                            )
                        );
                        return;
                    }

                    if (error.code === "LIMIT_FILE_COUNT") {
                        reject(
                            new AppError(
                                `Voce pode enviar ate ${MAX_CHATBOT_FILES} arquivos por mensagem.`,
                                400,
                                "FILE_COUNT_LIMIT"
                            )
                        );
                        return;
                    }

                    reject(new AppError("Falha no upload dos anexos.", 400, `MULTER_${error.code}`));
                    return;
                }

                reject(error);
            });
        });
    }

    private async persistUserMessage(params: {
        conversationId: number;
        userContent: string;
        uploadedFiles: UploadedChatFile[];
        editingMessageId: number | null;
    }) {
        const { conversationId, userContent, uploadedFiles, editingMessageId } = params;

        if (!editingMessageId) {
            return MessageRepository.create({
                conversationId,
                role: "user",
                content: userContent,
                files: this.toStoredFiles(uploadedFiles),
                date: new Date().toISOString(),
            });
        }

        const targetMessage = await MessageRepository.getById(editingMessageId);
        if (!targetMessage || targetMessage.del) {
            throw ErrorTypes.NotFound("Mensagem para edicao nao encontrada.");
        }

        if (targetMessage.conversationId !== conversationId) {
            throw ErrorTypes.BadRequest("Mensagem para edicao nao pertence a conversa informada.");
        }

        if (targetMessage.role !== "user") {
            throw ErrorTypes.BadRequest("Apenas mensagens do usuario podem ser editadas.");
        }

        await MessageRepository.softDeleteByConversationAfterMessage(conversationId, targetMessage.id);

        return targetMessage.update({
            content: userContent,
        });
    }

    private mapUploadedFiles(req: Request): UploadedChatFile[] {
        const files = (req.files as Express.Multer.File[] | undefined) ?? [];
        if (!files.length) return [];

        const apiBase =
            process.env.API_URL?.replace(/\/$/, "") || `${req.protocol}://${req.get("host")}`;

        return files.map((file) => ({
            name: file.originalname,
            url: `${apiBase}/public/uploads/chatbot/${file.filename}`,
            mimeType: String(file.mimetype || ""),
            filePath: String(file.path || path.join(CHATBOT_UPLOAD_DIR, file.filename)),
        }));
    }

    private async buildResponseInput(
        messages: Array<{ id?: number; role: string; content: string; files?: unknown; del?: boolean }>,
        options?: {
            latestUserMessageId?: number;
            latestUploadedFiles?: UploadedChatFile[];
        }
    ): Promise<ResponseInputMessage[]> {
        const latestMessages = messages
            .filter((item) => !item.del)
            .slice(-20);

        const latestUploadParts =
            options?.latestUploadedFiles && options.latestUploadedFiles.length > 0
                ? await this.buildUploadedFileInputParts(options.latestUploadedFiles)
                : [];

        const responseInput: ResponseInputMessage[] = [];

        for (const message of latestMessages) {
            const normalizedRole: "user" | "assistant" =
                message.role === "assistant" ? "assistant" : "user";

            const contentText = String(message.content ?? "").trim();

            if (normalizedRole === "assistant") {
                responseInput.push({
                    role: "assistant",
                    content: contentText || "Mensagem sem conteudo visivel.",
                });
                continue;
            }

            const contentParts: UserInputPart[] = [];
            if (contentText) {
                contentParts.push({
                    type: "input_text",
                    text: contentText,
                });
            }

            if (
                options?.latestUserMessageId &&
                message.id === options.latestUserMessageId &&
                latestUploadParts.length > 0
            ) {
                contentParts.push(...latestUploadParts);
            } else {
                const storedFiles = normalizeStoredFiles(message.files);
                const storedFileParts = await Promise.all(
                    storedFiles.map((file) => this.buildStoredFileInputPart(file))
                );
                contentParts.push(
                    ...storedFileParts.filter((part): part is UserInputPart => Boolean(part))
                );
            }

            if (!contentParts.length) {
                contentParts.push({
                    type: "input_text",
                    text: "Mensagem sem conteudo visivel.",
                });
            }

            responseInput.push({
                role: "user",
                content: contentParts,
            });
        }

        return responseInput;
    }

    private async buildUploadedFileInputParts(uploadedFiles: UploadedChatFile[]): Promise<UserInputPart[]> {
        const parts: UserInputPart[] = [];

        for (const file of uploadedFiles) {
            try {
                const fileBuffer = await fs.promises.readFile(file.filePath);

                if (this.isImageFile(file)) {
                    parts.push({
                        type: "input_image",
                        image_url: this.toImageDataUrl(file, fileBuffer),
                        detail: "auto",
                    });

                    continue;
                }

                parts.push({
                    type: "input_file",
                    filename: file.name,
                    file_data: this.toFileDataUrl(file, fileBuffer),
                });
            } catch (_error) {
                const storedPart = await this.buildStoredFileInputPart(file);
                if (storedPart) {
                    parts.push(storedPart);
                }
            }
        }

        return parts;
    }

    private async buildStoredFileInputPart(file: StoredChatFile): Promise<UserInputPart | null> {
        const fileBuffer = await this.readStoredFileBuffer(file);
        if (!fileBuffer) return null;

        if (this.isImageFile(file)) {
            return {
                type: "input_image",
                image_url: this.toImageDataUrl(file, fileBuffer),
                detail: "auto",
            };
        }

        return {
            type: "input_file",
            filename: file.name,
            file_data: this.toFileDataUrl(file, fileBuffer),
        };
    }

    private toImageDataUrl(file: { name: string; mimeType?: string }, fileBuffer: Buffer): string {
        const mimeType = this.getImageMimeType(file);
        return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
    }

    private toFileDataUrl(file: { name: string; mimeType?: string }, fileBuffer: Buffer): string {
        const mimeType = this.getFileMimeType(file);
        return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
    }

    private async readStoredFileBuffer(file: StoredChatFile): Promise<Buffer | null> {
        const localPath = this.resolveStoredFileLocalPath(file.url);
        if (localPath) {
            try {
                return await fs.promises.readFile(localPath);
            } catch (_error) {
                // fallback to HTTP download below
            }
        }

        const fileUrl = String(file.url ?? "").trim();
        if (!fileUrl) return null;

        try {
            const response = await fetch(fileUrl);
            if (!response.ok) return null;
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        } catch (_error) {
            return null;
        }
    }

    private resolveStoredFileLocalPath(fileUrl: string): string | null {
        const rawUrl = String(fileUrl ?? "").trim();
        if (!rawUrl) return null;

        let pathName = rawUrl;
        try {
            if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(rawUrl)) {
                pathName = new URL(rawUrl).pathname;
            }
        } catch (_error) {
            pathName = rawUrl;
        }

        const normalizedPathName = decodeURIComponent(pathName).replace(/\\/g, "/");
        const uploadPathPrefix = "/public/uploads/chatbot/";
        if (!normalizedPathName.startsWith(uploadPathPrefix)) return null;

        const fileName = path.basename(normalizedPathName);
        if (!fileName) return null;

        return path.join(CHATBOT_UPLOAD_DIR, fileName);
    }

    private toStoredFiles(uploadedFiles: UploadedChatFile[]): StoredChatFile[] {
        return uploadedFiles.map((file) => ({
            name: file.name,
            url: file.url,
        }));
    }

    private isImageFile(file: { name: string; mimeType?: string }): boolean {
        const normalizedMimeType = String(file.mimeType ?? "").toLowerCase();
        if (normalizedMimeType.startsWith("image/")) return true;

        const extension = path.extname(file.name || "").toLowerCase();
        return IMAGE_EXTENSIONS.has(extension);
    }

    private getImageMimeType(file: { name: string; mimeType?: string }): string {
        const normalizedMimeType = String(file.mimeType ?? "").toLowerCase();
        if (normalizedMimeType.startsWith("image/")) return normalizedMimeType;

        const extension = path.extname(file.name || "").toLowerCase();
        switch (extension) {
            case ".png":
                return "image/png";
            case ".webp":
                return "image/webp";
            case ".gif":
                return "image/gif";
            case ".jpeg":
            case ".jpg":
            default:
                return "image/jpeg";
        }
    }

    private getFileMimeType(file: { name: string; mimeType?: string }): string {
        const normalizedMimeType = String(file.mimeType ?? "").toLowerCase();
        if (normalizedMimeType) return normalizedMimeType;

        const extension = path.extname(file.name || "").toLowerCase();
        switch (extension) {
            case ".pdf":
                return "application/pdf";
            case ".txt":
                return "text/plain";
            case ".png":
                return "image/png";
            case ".webp":
                return "image/webp";
            case ".gif":
                return "image/gif";
            case ".jpeg":
            case ".jpg":
                return "image/jpeg";
            default:
                return "application/octet-stream";
        }
    }

    private getErrorMessage(error: unknown): string {
        if (error instanceof AppError) {
            return error.message;
        }

        if (error instanceof Error) {
            return error.message || "Erro inesperado ao processar stream.";
        }

        return "Erro inesperado ao processar stream.";
    }

    private handleError(error: unknown, res: Response): Response {
        if (error instanceof AppError) {
            return HttpResponse.handleAppError(res, error);
        }

        return HttpResponse.handleUnknownError(res, error);
    }
}
