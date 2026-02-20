import jwt, { SignOptions, JwtPayload, Secret } from "jsonwebtoken";
import { AppError } from "../errors/AppError";
import { ErrorTypes } from "../errors/ErrorTypes";

/**
 * Serviço responsável por gerenciar operações envolvendo JWT.
 */
export class JwtService {
    private readonly secret: Secret;
    private readonly defaultExpiresIn: string;

    constructor() {
        const rawSecret = process.env.JWT_SECRET;

        if (!rawSecret) {
            throw new AppError(
                "JWT_SECRET não está configurado!",
                500,
                "JwtConfigurationError"
            );
        }

        this.secret = rawSecret as Secret;
        this.defaultExpiresIn = process.env.JWT_EXPIRES_IN || "1h";
    }

    /**
     * Gera um token JWT assinado.
     */
    generateToken(payload: Record<string, any>, options?: SignOptions): string {
        try {
            const signOptions: SignOptions = {
                expiresIn: this.defaultExpiresIn as any,
                ...(options ?? {}),
            };

            return jwt.sign(payload, this.secret, signOptions);
        } catch {
            throw new AppError("Erro ao gerar token JWT", 500, "JwtSignError");
        }
    }

    /**
     * Verifica se o token é válido.
     */
    verifyToken(token: string): JwtPayload | string {
        try {
            const normalized = (token || "").trim().replace(/^Bearer\s+/i, "");
            if (!normalized) throw ErrorTypes.Unauthorized("Token inválido ou expirado.");
            return jwt.verify(normalized, this.secret);
        } catch {
            throw ErrorTypes.Unauthorized("Token inválido ou expirado.");
        }
    }

    /**
     * Decodifica um token sem verificar assinatura.
     */
    decodeToken(token: string): null | JwtPayload | string {
        return jwt.decode(token);
    }

    /**
     * Renova o token mantendo o mesmo payload.
     */
    refreshToken(token: string): string {
        try {
            const decoded = this.verifyToken(token);

            const payload =
                typeof decoded === "string"
                    ? {}
                    : {
                        ...decoded,
                        iat: undefined,
                        exp: undefined,
                    };

            return this.generateToken(payload);
        } catch {
            throw ErrorTypes.Unauthorized("Não foi possível renovar o token.");
        }
    }
}
