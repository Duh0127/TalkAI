import express from "express";
import path from "path";
import cors from "cors";
import type { CorsOptions, CorsOptionsDelegate } from "cors";

import { sequelize } from "./config/database";
import { loadModels } from "./models";
import { loadRoutes } from "./routes";
import { env } from "./config/env";

const app = express();
app.use(express.json());

const allowedOrigins = (env.corsOrigins ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const baseCorsOptions: CorsOptions = {
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

const corsDelegate: CorsOptionsDelegate = (req, cb) => {
  const origin = req.headers.origin as string | undefined;

  // Postman/cURL/server-to-server (sem Origin)
  if (!origin) return cb(null, { ...baseCorsOptions, origin: true });

  // Se quiser liberar tudo em dev quando allowlist estiver vazia:
  if (allowedOrigins.length === 0 && process.env.NODE_ENV !== "production") {
    return cb(null, { ...baseCorsOptions, origin: true });
  }

  const isAllowed = allowedOrigins.includes(origin);

  // Sem "Error" aqui: só não seta headers de CORS quando não permitido
  return cb(null, { ...baseCorsOptions, origin: isAllowed });
};
app.use(cors(corsDelegate));

app.use("/upload", express.static(path.join(process.cwd(), "upload")));
app.use("/public", express.static(path.join(process.cwd(), "public")));

loadModels(sequelize);

sequelize.sync().then(() => {
  console.log("Banco sincronizado.");
});

loadRoutes(app);

app.listen(env.port, () => {
  console.log(`Servidor rodando na porta ${env.port}`);
});
