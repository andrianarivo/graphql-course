import { SubscriptionResolvers } from '../generated/graphql'
import { Post } from '../generated/graphql'
import {GraphQLError} from "graphql/error";

const Subscription: SubscriptionResolvers = {
  comment: {
    subscribe(parent, {postId}, {db, pubsub}, info) {
      const post = db.posts.find((post: Post) => post.id === postId && post.published)

      if (!post) {
        throw new GraphQLError('Post not found')
      }

      return pubsub.subscribe('comment', postId)
    },
    resolve: (payload: any) => payload
  },
  post: {
    subscribe(parent, args, { pubsub}, info) {
      return pubsub.subscribe('post')
    },
    resolve: (payload: any) => payload
  }
}

export { Subscription as default }