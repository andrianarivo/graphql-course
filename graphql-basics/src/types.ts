import {Comment, Post, User, PostSubscriptionPayload} from './generated/graphql'
import {PubSub, YogaInitialContext} from "graphql-yoga";

export interface Context extends YogaInitialContext {
  db: {
    users: User[]
    posts: Post[]
    comments: Comment[]
    count: number
  }
  pubsub: PubSub<PubSubChannels>
}

export type PubSubChannels = {
  'updated:count': [count: number]
  'comment': [postId: string, comment: Comment]
  'post': [payload: PostSubscriptionPayload]
}
