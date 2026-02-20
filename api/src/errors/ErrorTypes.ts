import { AppError } from "./AppError";

/**
 * Fábrica de erros padronizados para reutilização em toda a aplicação.
 * Cobre desde erros de domínio até infraestrutura.
 */
export class ErrorTypes {
    /* ========================================================================
     *  Erros de Recurso
     * ===================================================================== */

    static NotFound(message = "Recurso não encontrado") {
        return new AppError(message, 404, "NOT_FOUND");
    }

    static AlreadyExists(message = "Recurso já existente") {
        return new AppError(message, 409, "ALREADY_EXISTS");
    }

    static Deleted(message = "Recurso removido") {
        return new AppError(message, 410, "GONE");
    }

    static InvalidState(message = "Estado inválido do recurso") {
        return new AppError(message, 409, "INVALID_STATE");
    }

    /* ========================================================================
     *  Validação de Dados
     * ===================================================================== */

    static Validation(message = "Dados inválidos") {
        return new AppError(message, 422, "VALIDATION_ERROR");
    }

    static MissingFields(message = "Campos obrigatórios ausentes") {
        return new AppError(message, 422, "MISSING_FIELDS");
    }

    static InvalidFormat(message = "Formato de dados inválido") {
        return new AppError(message, 400, "INVALID_FORMAT");
    }

    static PayloadTooLarge(message = "Payload excede o tamanho permitido") {
        return new AppError(message, 413, "PAYLOAD_TOO_LARGE");
    }

    /* ========================================================================
     *  Autenticação
     * ===================================================================== */

    static Unauthorized(message = "Não autorizado") {
        return new AppError(message, 401, "UNAUTHORIZED");
    }

    static InvalidCredentials(message = "Credenciais inválidas") {
        return new AppError(message, 401, "INVALID_CREDENTIALS");
    }

    static TokenExpired(message = "Token expirado") {
        return new AppError(message, 401, "TOKEN_EXPIRED");
    }

    static TokenInvalid(message = "Token inválido") {
        return new AppError(message, 401, "TOKEN_INVALID");
    }

    /* ========================================================================
     *  Autorização / Permissões
     * ===================================================================== */

    static Forbidden(message = "Acesso proibido") {
        return new AppError(message, 403, "FORBIDDEN");
    }

    static InsufficientRole(message = "Permissão insuficiente") {
        return new AppError(message, 403, "INSUFFICIENT_ROLE");
    }

    static OwnershipRequired(message = "Recurso pertence a outro usuário") {
        return new AppError(message, 403, "OWNERSHIP_REQUIRED");
    }

    /* ========================================================================
     *  Negócio / Domínio
     * ===================================================================== */

    static BusinessRule(message = "Regra de negócio violada") {
        return new AppError(message, 409, "BUSINESS_RULE_VIOLATION");
    }

    static OperationNotAllowed(message = "Operação não permitida") {
        return new AppError(message, 405, "OPERATION_NOT_ALLOWED");
    }

    static LimitExceeded(message = "Limite máximo atingido") {
        return new AppError(message, 429, "LIMIT_EXCEEDED");
    }

    /* ========================================================================
     *  Infraestrutura (DB, Rede, API externa, Cache)
     * ===================================================================== */

    static Database(message = "Erro no banco de dados") {
        return new AppError(message, 500, "DATABASE_ERROR");
    }

    static ExternalService(message = "Erro ao comunicar com serviço externo") {
        return new AppError(message, 502, "EXTERNAL_SERVICE_ERROR");
    }

    static Network(message = "Falha de rede") {
        return new AppError(message, 503, "NETWORK_ERROR");
    }

    static Cache(message = "Erro ao acessar cache") {
        return new AppError(message, 500, "CACHE_ERROR");
    }

    static Timeout(message = "Tempo limite excedido") {
        return new AppError(message, 504, "TIMEOUT");
    }

    /* ========================================================================
     *  Sistema / Dependências
     * ===================================================================== */

    static DependencyMissing(message = "Dependência obrigatória ausente") {
        return new AppError(message, 500, "DEPENDENCY_MISSING");
    }

    static Environment(message = "Variáveis de ambiente ausentes ou inválidas") {
        return new AppError(message, 500, "ENVIRONMENT_ERROR");
    }

    static Config(message = "Erro de configuração da aplicação") {
        return new AppError(message, 500, "CONFIG_ERROR");
    }

    /* ========================================================================
     *  Genérico / Fallback
     * ===================================================================== */

    static BadRequest(message = "Requisição inválida") {
        return new AppError(message, 400, "BAD_REQUEST");
    }

    static Conflict(message = "Conflito de dados") {
        return new AppError(message, 409, "CONFLICT");
    }

    static Internal(message = "Erro interno no servidor") {
        return new AppError(message, 500, "INTERNAL_ERROR");
    }
}
