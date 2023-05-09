"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Painting = exports.sequelize = void 0;
var sequelize_1 = require("./sequelize");
Object.defineProperty(exports, "sequelize", { enumerable: true, get: function () { return __importDefault(sequelize_1).default; } });
var painting_1 = require("./painting");
Object.defineProperty(exports, "Painting", { enumerable: true, get: function () { return __importDefault(painting_1).default; } });
const sequelize_2 = __importDefault(require("./sequelize"));
const painting_2 = __importDefault(require("./painting"));
const db = {
    sequelize: sequelize_2.default,
    Painting: painting_2.default,
};
exports.default = db;
