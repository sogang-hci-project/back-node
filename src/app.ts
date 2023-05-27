import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";

import { corsOptions, isProd, maxAge, sessionOptions } from "~/config/module";
import { getRouter, postRouter } from "./routes";
import db from "~/models";

const app = express();
app.set("port", 3030);
const port = app.get("port");

if (isProd) {
  app.use(morgan("combined"));
  sessionOptions.cookie.domain = ".sgu-hci.p-e.kr";
} else {
  app.use(morgan("dev"));
  sessionOptions.cookie.domain = ".sgu-hci.p-e.kr";
}

app.use(session(sessionOptions));
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json(`서버 연결 성공: ${req.protocol}, ${process.env.NODE_ENV || "develop"}`);
});

app.get("/test", (req: any, res: any, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://localhost:3000");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res
    .status(200)
    .cookie("x_auth", "test123123", {
      secure: true,
      sameSite: "None",
      httpOnly: true,
    })
    .json({ message: "??" });
});

app.use("/api/v1", getRouter);
app.use("/api/v1", postRouter);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  res.status(210).json({ message: "API 서버 내부 오류가 발생했습니다.", error });
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
