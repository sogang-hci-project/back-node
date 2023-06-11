import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";

import { corsOptions, isProd } from "~/config";
import { apiGetRouter, apiPostRouter, llmPostRouter } from "./routes";

const app = express();
app.set("port", process.env.PORT || 3030);
const port = app.get("port");

if (isProd) {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json(`서버 연결 성공: ${req.protocol}, ${process.env.NODE_ENV || "develop"}`);
});

app.use("/api/v1", apiGetRouter);
app.use("/api/v1", apiPostRouter);
app.use("/api/v1", llmPostRouter);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  res.status(210).json({ message: "API 서버 내부 오류가 발생했습니다.", error });
});

app.listen(port, () => {
  console.log(`
      -----------------------------------
              🎉DB 연결성공🎉
              http://localhost:${port}
      -----------------------------------
    `);
});
