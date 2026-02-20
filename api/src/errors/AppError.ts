/**
 * Classe base para erros da aplicação.
 * Permite padronizar o formato de retorno de erros.
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;

    /**
     * @param {string} message - Mensagem de erro amigável.
     * @param {number} statusCode - Código HTTP que representa o erro.
     * @param {string} code - Código interno para identificação do tipo de erro.
     */
    constructor(message: string, statusCode = 400, code = "APP_ERROR") {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
