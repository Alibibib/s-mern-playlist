// src/graphql/typeDefs.ts
export const typeDefs = `#graphql
  type User {
    id: ID!
    username: String!
    email: String!
    firstName: String!
    lastName: String!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
    firstName: String!
    lastName: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type Query {
    hello: String!
    me: User
    users: [User!]!
    user(id: ID!): User
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updateUser(id: ID!, firstName: String, lastName: String): User!
    deleteUser(id: ID!): Boolean!
  }

  type Subscription {
    serverTime: String!
    userCreated: User!
  }
`;