import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";

import db from "~/models";
import { postPaintingInfo } from "./controllers";
const app = express();
const isProd = process.env.NODE_ENV === "production";

app.set("port", 3030);
const port = app.get("port");
var corsOptions = {
  origin: true,
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

if (isProd) {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (req: any, res: any) => {
  res.send(`서버 연결 성공: ${req.protocol}, ${process.env.NODE_ENV}`);
});

app.post("/request", postPaintingInfo);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  res.status(210).json({ message: "서버 내부 오류가 발생했습니다.", error });
});

app.listen(port, () => {
  db.sequelize
    .sync({ alter: false })
    .then(() =>
      console.log(`
      -----------------------------------
              🎉DB 연결성공🎉
              http://localhost:${app.get("port")}
      -----------------------------------
    `)
    )
    .catch((e) => console.error(`앱 실행에서 오류가 발생 했습니다. :${e}`));
});
