"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postPaintingInfo = void 0;
const axios_1 = __importDefault(require("axios"));
const postPaintingInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { question } = req.body;
        const result = yield axios_1.default.post("http://127.0.0.1:5000/hello", { question });
        const contents = result.data;
        res.status(200).json({ message: "success", contents });
    }
    catch (e) {
        console.error("에러가 발생", e);
        next();
    }
});
exports.postPaintingInfo = postPaintingInfo;
