import {PubSub} from "graphql-yoga"
import type PrismaTypes from "@pothos/plugin-prisma/generated"
import {PubSubEvents} from "./pubsub";

export type GraphQLContext = {
  pubsub: PubSub<PubSubEvents>,
  currentUser: {} | null | undefined
}

export type SchemaBuilderType = {
  Scalars: {
    Date: { Input: Date; Output: Date }
  },
  PrismaTypes: PrismaTypes,
  Context: GraphQLContext
}