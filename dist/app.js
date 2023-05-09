"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const models_1 = __importDefault(require("./models"));
const controllers_1 = require("./controllers");
const app = (0, express_1.default)();
const isProd = process.env.NODE_ENV === "production";
app.set("port", 3030);
const port = app.get("port");
var corsOptions = {
    origin: true,
    credentials: true,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
if (isProd) {
    app.use((0, morgan_1.default)("combined"));
}
else {
    app.use((0, morgan_1.default)("dev"));
}
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
app.get("/", (req, res) => {
    res.send(`서버 연결 성공: ${req.protocol}, ${process.env.NODE_ENV}`);
});
app.post("/request", controllers_1.postPaintingInfo);
app.use((error, req, res, next) => {
    res.status(210).json({ message: "서버 내부 오류가 발생했습니다.", error });
});
app.listen(port, () => {
    models_1.default.sequelize
        .sync({ alter: false })
        .then(() => console.log(`
      -----------------------------------
              🎉DB 연결성공🎉
              http://localhost:${app.get("port")}
      -----------------------------------
    `))
        .catch((e) => console.error(`앱 실행에서 오류가 발생 했습니다. :${e}`));
});
