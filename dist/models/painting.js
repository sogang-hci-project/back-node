"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.associate = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("./sequelize"));
class Painting extends sequelize_1.Model {
}
Painting.init({
    name: {
        type: sequelize_1.DataTypes.STRING(30),
        allowNull: false,
    },
    author: {
        type: sequelize_1.DataTypes.STRING(30),
        allowNull: false,
    },
    year: {
        type: sequelize_1.DataTypes.STRING(30),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
}, {
    sequelize: sequelize_2.default,
    modelName: "Painting",
    tableName: "paintings",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
});
const associate = (db) => { };
exports.associate = associate;
exports.default = Painting;
