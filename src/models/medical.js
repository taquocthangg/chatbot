'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class MedicalData extends Model {
        static associate(models) {
           // define association here
        }
    }
    MedicalData.init({
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        type: {
          type: DataTypes.ENUM('text', 'url'),
          allowNull: false,
        },
        url: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      }, {
        sequelize,
        modelName: 'MedicalData',
      });
    return MedicalData;
};
