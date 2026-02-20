import fs from "fs";
import path from "path";
import { Express } from "express";
import { apiRateLimit } from "../middlewares/rateLimit";

export const loadRoutes = (app: Express) => {
    const dir = __dirname;

    const files = fs
        .readdirSync(dir)
        .filter((file) => file.endsWith(".routes.ts"));

    for (const file of files) {
        const routePath = path.join(dir, file);
        const routeModule = require(routePath);

        if (!routeModule.default) continue;

        const router = routeModule.default;
        const alias = routeModule.routeAlias ?? `/${file.replace(".routes.ts", "").replace(".routes.js", "")}`;

        const fullPath = `/api${alias}`;

        app.use(fullPath, apiRateLimit, router);
        console.log(`📌 Rotas carregadas: ${fullPath}`);
    }
};
