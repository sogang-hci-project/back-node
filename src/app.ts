import express, { Request, Response, NextFunction } from "express";

import db from "~/models";
import { getPaintingInfo } from "./controllers";
// import { runAPI } from "~/api/openai";

const app = express();

app.set("port", 3030);
const port = app.get("port");

// express body 사이즈 조절
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (req: any, res: any) => {
  res.send(`서버 연결 성공: ${req.protocol}, ${process.env.NODE_ENV}`);
});

app.get("/request", getPaintingInfo);

// 에러처리 미들웨어
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
  // runAPI();
});
