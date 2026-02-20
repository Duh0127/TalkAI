import {
  DataTypes,
  Sequelize,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { env } from "../config/env";

export class Conversation extends Model<
  InferAttributes<Conversation>,
  InferCreationAttributes<Conversation, { omit: "id" }>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare del: CreationOptional<boolean>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static associate(models: any): void {
    Conversation.hasMany(models.Message, {
      foreignKey: "conversationId",
      as: "messages",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  }
}

export default (sequelize: Sequelize) => {
  Conversation.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: "Nome da conversa",
      },

      del: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Exclusão lógica (flag)",
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
      modelName: "Conversation",
      tableName: `${env.prefix}conversation`,
      indexes: [
        { name: "idx_conversation_del", fields: ["del"] },
        { name: "idx_conversation_name", fields: ["name"] },
      ],
    }
  );

  return Conversation;
};
