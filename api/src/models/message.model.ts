import {
    DataTypes,
    Sequelize,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
} from "sequelize";
import { env } from "../config/env";

export class Message extends Model<
    InferAttributes<Message>,
    InferCreationAttributes<Message, { omit: "id" }>
> {
    declare id: CreationOptional<number>;

    declare conversationId: ForeignKey<number>;

    declare role: string;
    declare content: string;
    declare files: CreationOptional<any>;
    declare date: string;
    declare del: CreationOptional<boolean>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    static associate(models: any): void {
        Message.belongsTo(models.Conversation, {
            foreignKey: "conversationId",
            as: "conversation",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
    }
}

export default (sequelize: Sequelize) => {
    Message.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },

            conversationId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                comment: "FK para Conversation",
                references: {
                    model: `${env.prefix}conversation`,
                    key: "id",
                },
            },

            role: {
                type: DataTypes.STRING(50),
                allowNull: false,
                comment: "Papel da mensagem (ex: user/assistant/system)",
            },

            content: {
                type: DataTypes.STRING(4000),
                allowNull: false,
                comment: "Conteúdo da mensagem",
            },

            files: {
                type: DataTypes.JSON,
                allowNull: true,
                comment: "Arquivos/anexos relacionados (JSON)",
            },

            date: {
                type: DataTypes.STRING(50),
                allowNull: false,
                comment: "Data da mensagem em string (ex: ISO)",
            },

            del: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: "Campo para exclusao logica",
            },

            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },

            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "Message",
            tableName: `${env.prefix}message`,
            indexes: [
                { name: "idx_message_conversationId", fields: ["conversationId"] },
                { name: "idx_message_date", fields: ["date"] },
            ],
        }
    );

    return Message;
};
