import path from "path";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

const UPLOAD_ROOT = path.join(process.cwd(), "upload");
export const USER_PHOTOS_DIR = path.join(UPLOAD_ROOT, "user-photos");

const MAX_FILE_SIZE_MB = Number(process.env.USER_PHOTO_MAX_MB ?? 5);
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_MIME = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
]);

const ALLOWED_EXT = new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".heic",
    ".heif",
]);

const MIME_TO_EXT: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/heic": ".heic",
    "image/heif": ".heif",
};

function ensureDirSync(dir: string) {
    fs.mkdirSync(dir, { recursive: true });
}

function sanitizeBaseName(name: string) {
    const cleaned = name
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");
    return cleaned.slice(0, 60) || "file";
}

function getSafeExt(originalName: string, mimetype: string) {
    const ext = path.extname(originalName).toLowerCase();
    if (ALLOWED_EXT.has(ext)) return ext;
    return MIME_TO_EXT[mimetype] ?? "";
}

function randomId() {
    return crypto.randomUUID?.() ?? crypto.randomBytes(16).toString("hex");
}

function mapMulterError(err: unknown) {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case "LIMIT_FILE_SIZE":
                return new AppError(`Arquivo muito grande. Máximo: ${MAX_FILE_SIZE_MB}MB.`, 413, "FileTooLarge");
            case "LIMIT_UNEXPECTED_FILE":
                return new AppError("Campo de arquivo inesperado (field name incorreto).", 400, "UnexpectedFileField");
            case "LIMIT_FILE_COUNT":
                return new AppError("Quantidade de arquivos excedida.", 400, "TooManyFiles");
            default:
                return new AppError("Erro no upload do arquivo.", 400, `Multer_${err.code}`);
        }
    }
    if (err instanceof AppError) return err;
    return new AppError("Falha ao processar upload.", 500, "UploadFailure");
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        try {
            ensureDirSync(USER_PHOTOS_DIR);
            cb(null, USER_PHOTOS_DIR);
        } catch (e) {
            cb(e as Error, USER_PHOTOS_DIR);
        }
    },

    filename: (_req, file, cb) => {
        try {
            const ext = getSafeExt(file.originalname, file.mimetype);
            if (!ext) {
                return cb(
                    new AppError("Não foi possível determinar a extensão do arquivo.", 400, "InvalidExtension"),
                    ""
                );
            }

            const base = sanitizeBaseName(path.parse(file.originalname).name);
            const fileName = `${Date.now()}_${randomId()}_${base}${ext}`;
            cb(null, fileName);
        } catch (e) {
            cb(e as Error, "");
        }
    },
});

const fileFilter: multer.Options["fileFilter"] = (req, file, cb: multer.FileFilterCallback) => {
    const ct = req.headers["content-type"] ?? "";
    if (!ct.includes("multipart/form-data")) {
        return cb(new AppError("Content-Type deve ser multipart/form-data.", 415, "InvalidContentType"));
    }

    if (!ALLOWED_MIME.has(file.mimetype)) {
        return cb(new AppError(`Tipo de arquivo não permitido (${file.mimetype}).`, 400, "InvalidMimeType"));
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (ext && !ALLOWED_EXT.has(ext)) {
        return cb(new AppError(`Extensão não permitida (${ext}).`, 400, "InvalidFileExtension"));
    }

    return cb(null, true);
};

const uploader = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
        files: 1,
        fields: 50,
        fieldNameSize: 100,
        fieldSize: 2 * 1024 * 1024,
    },
});

export function uploadUserPhoto(
    fieldName = "photo",
    opts: { required?: boolean } = {}
) {
    const { required = false } = opts;
    const mw = uploader.single(fieldName);

    return (req: Request, res: Response, next: NextFunction) => {
        mw(req, res, (err: unknown) => {
            if (err) return next(mapMulterError(err));

            const file = (req as any).file as { filename?: string; path?: string } | undefined;

            if (!file) {
                if (required) return next(new AppError("Arquivo não enviado.", 400, "FileRequired"));
                return next();
            }

            const savedPath = file.path || "";
            const normalized = path.normalize(savedPath);
            const expected = path.normalize(USER_PHOTOS_DIR);

            if (!normalized.startsWith(expected)) {
                return next(new AppError("Destino de upload inválido.", 500, "InvalidUploadDestination"));
            }

            const base = process.env.API_URL;
            req.body.photo = `${base}/upload/user-photos/${file.filename}`;

            return next();
        });
    };
}
