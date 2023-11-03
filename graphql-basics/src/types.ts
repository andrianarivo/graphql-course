import {Comment, Post, User} from './generated/graphql'
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
  'created:comment': [postId: string, comment: Comment]
}
