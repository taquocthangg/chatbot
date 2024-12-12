'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ChatHistory extends Model {
        static associate(models) {
            ChatHistory.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user',
                onDelete: 'CASCADE',
            });
        }
    }
    ChatHistory.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "User",
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        question: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        response: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'ChatHistory',
    });

    return ChatHistory;
};
