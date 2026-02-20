import rateLimit from "express-rate-limit";

export const apiRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        error: "Too Many Requests",
        message: "Número de requisições excedido. Tente novamente mais tarde."
    }
});