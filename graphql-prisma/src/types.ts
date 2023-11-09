import {PubSub} from "graphql-yoga"
import type PrismaTypes from "@pothos/plugin-prisma/generated"
import {PubSubChannels} from "./pubsub";

export type SchemaBuilderType = {
  Scalars: {
    Date: { Input: Date; Output: Date }
  },
  PrismaTypes: PrismaTypes,
  Context: { pubsub: PubSub<PubSubChannels> }
}