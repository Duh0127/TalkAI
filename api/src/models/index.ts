import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";

export const loadModels = (sequelize: Sequelize) => {
  const models: any = {};
  const dir = __dirname;

  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".model.ts") || file.endsWith(".model.js"));

  for (const file of files) {
    const modelPath = path.join(dir, file);
    const model = require(modelPath).default(sequelize);

    models[model.name] = model;
  }

  // Rodar associações se o model tiver
  Object.values(models).forEach((model: any) => {
    if (typeof model.associate === "function") {
      model.associate(models);
    }
  });

  return models;
};
