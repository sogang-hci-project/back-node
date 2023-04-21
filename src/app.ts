import express, { Request, Response, NextFunction } from "express";
import { ApolloServer, gql } from "apollo-server-express";

import db, { User } from "~/models";

const app = express();

// Apollo Server 미들웨어를 Express 애플리케이션에 등록
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
  }

  type Query {
    getUsers: [User]
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String!): User
  }
`;

// GraphQL 리졸버 정의
const resolvers = {
  Query: {
    getUsers: async () => {
      return await User.findAll();
    },
  },
  Mutation: {
    createUser: async (_: any, args: { name: any; age: any; email: any }) => {
      const { name, age, email } = args;
      return await User.create({ name, age, email });
    },
  },
};

app.set("port", 3030);
const port = app.get("port");
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Apollo Server 미들웨어를 Express 앱에 등록
async function startServer() {
  await server.start();
  server.applyMiddleware({ app });
}

// express body 사이즈 조절
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 테스트 GET 라우터
app.get("/", (req: any, res: any) => {
  res.send(`서버 연결 성공: ${req.protocol}, ${process.env.NODE_ENV}`);
});

// 에러처리 미들웨어
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  res.status(210).json({ message: "서버 내부 오류가 발생했습니다.", error });
});

startServer().then(() => {
  app.listen(port, () => {
    db.sequelize
      .sync({ alter: true })
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
});
