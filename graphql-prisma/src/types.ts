import {Comment, Post, User, PostSubscriptionPayload, CommentSubscriptionPayload} from './generated/graphql'
import {PubSub, YogaInitialContext} from "graphql-yoga"
import {PrismaClient} from "@prisma/client"
import type PrismaTypes from "@pothos/plugin-prisma/generated"

export interface Context extends YogaInitialContext {
  db: {
    users: User[]
    posts: Post[]
    comments: Comment[]
    count: number
  }
  pubsub: PubSub<PubSubChannels>
  prisma: PrismaClient
}

export type PubSubChannels = {
  'updated:count': [count: number]
  'comment': [postId: string, payload: CommentSubscriptionPayload]
  'post': [payload: PostSubscriptionPayload]
}

export type SchemaBuilderType = {
  Scalars: {
    Date: { Input: Date; Output: Date }
  },
  PrismaTypes: PrismaTypes
}