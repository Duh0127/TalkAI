import { Response } from "express";
import { AppError } from "../errors/AppError";

/**
 * Utilitário responsável por padronizar todas as respostas HTTP da API.
 * 
 * Formato:
 * {
 *   success: boolean;
 *   data?: any;
 *   message?: string;
 *   error?: string;
 *   code?: string;
 * }
 */
export class HttpResponse {
    /**
     * Retorno 200 - Sucesso padrão.
     */
    static ok(res: Response, data?: unknown, message?: string) {
        return res.status(200).json({
            success: true,
            data,
            message
        });
    }

    /**
     * Retorno 201 - Recurso criado.
     */
    static created(res: Response, data?: unknown, message?: string) {
        return res.status(201).json({
            success: true,
            data,
            message
        });
    }

    /**
     * Retorno 200 apenas com mensagem ou mensagem + data.
     */
    static message(res: Response, message: string, data?: unknown) {
        return res.status(200).json({
            success: true,
            message,
            data
        });
    }

    /**
     * Lida com erros lançados como AppError.
     */
    static handleAppError(res: Response, error: AppError) {
        return res.status(error.statusCode).json({
            success: false,
            error: error.name,
            message: error.message,
            code: error.code
        });
    }

    /**
     * Lida com erros inesperados (não AppError).
     */
    static handleUnknownError(res: Response, error: unknown) {
        console.error("[UNEXPECTED ERROR]", error);

        return res.status(500).json({
            success: false,
            error: "InternalServerError",
            message: "Erro interno no servidor",
            code: "INTERNAL_ERROR"
        });
    }

    /* ========================================================================
     * ERROS PADRÕES (Todos com data? e message? opcionais)
     * ===================================================================== */

    static badRequest(res: Response, message = "Requisição inválida", data?: unknown) {
        return res.status(400).json({
            success: false,
            error: "BadRequest",
            message,
            code: "BAD_REQUEST",
            data
        });
    }

    static unauthorized(res: Response, message = "Não autorizado", data?: unknown) {
        return res.status(401).json({
            success: false,
            error: "Unauthorized",
            message,
            code: "UNAUTHORIZED",
            data
        });
    }

    static forbidden(res: Response, message = "Acesso negado", data?: unknown) {
        return res.status(403).json({
            success: false,
            error: "Forbidden",
            message,
            code: "FORBIDDEN",
            data
        });
    }

    static notFound(res: Response, message = "Recurso não encontrado", data?: unknown) {
        return res.status(404).json({
            success: false,
            error: "NotFound",
            message,
            code: "NOT_FOUND",
            data
        });
    }

    static conflict(res: Response, message = "Conflito de dados", data?: unknown) {
        return res.status(409).json({
            success: false,
            error: "Conflict",
            message,
            code: "CONFLICT",
            data
        });
    }
}
