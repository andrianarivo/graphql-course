import {Comment, Post, User, PostSubscriptionPayload, CommentSubscriptionPayload} from './generated/graphql'
import {PubSub, YogaInitialContext} from "graphql-yoga"
import {PrismaClient} from "@prisma/client"

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
