import { ApolloServer, gql } from "apollo-server-express";
import { User } from "~/models";

const typeDefs = gql`
  type User {
    id: Int
    name: String
    email: String
    password: String
  }

  type Query {
    getUser(id: Int): User
    getUsers: [User]
  }

  type Mutation {
    createUser(name: String, email: String, password: String): User
  }
`;

// Define the GraphQL resolvers
const resolvers = {
  Query: {
    getUser: async (_: any, { id }: { id: number }) => {
      try {
        const user = await User.findByPk(id);
        return user;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch user");
      }
    },
    getUsers: async () => {
      try {
        const users = await User.findAll();
        return users;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch users");
      }
    },
  },
  Mutation: {
    createUser: async (_: any, { name, email, password }: { name: string; email: string; password: string }) => {
      try {
        const user = await User.create({ name, email, password });
        return user;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to create user");
      }
    },
  },
};
