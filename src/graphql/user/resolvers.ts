import { User } from "~/models";

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
