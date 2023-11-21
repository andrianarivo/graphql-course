import {PubSub} from "graphql-yoga"
import type PrismaTypes from "@pothos/plugin-prisma/generated"
import {PubSubEvents} from "./pubsub";
import {Auth0User} from "./controllers/concerns/GetUserId";

export type GraphQLContext = {
  pubsub: PubSub<PubSubEvents>,
  currentUser: Auth0User
}

export type SchemaBuilderType = {
  Scalars: {
    Date: { Input: Date; Output: Date }
  },
  PrismaTypes: PrismaTypes,
  Context: GraphQLContext
}