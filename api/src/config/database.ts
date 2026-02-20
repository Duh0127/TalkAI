import { Sequelize } from "sequelize";
import { env } from "./env";

export const sequelize = new Sequelize({
    database: env.database,
    username: env.username,
    password: env.password,
    host: env.host,
    dialect: env.dialect,
    logging: false
});
