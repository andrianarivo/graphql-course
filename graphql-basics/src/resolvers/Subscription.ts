import { SubscriptionResolvers } from '../generated/graphql'
import {Repeater} from "graphql-yoga"
import { Post } from '../generated/graphql'
import {GraphQLError} from "graphql/error";

const Subscription: SubscriptionResolvers = {
  count: {
    subscribe(parent, args, ctx, info) {
      return new Repeater((push, stop) => {
        let counter = 0

        function increment() {
          push(counter++);
          console.log('push')
        }

        increment()
        const interval = setInterval(increment, 1000)
        stop.then(() => {
          clearInterval(interval)
          console.log('stop')
        })
      })
    },
    resolve: (payload: any) => payload
  },
  comment: {
    subscribe(parent, {postId}, {db, pubsub}, info) {
      const post = db.posts.find((post: Post) => post.id === postId && post.published)

      if (!post) {
        throw new GraphQLError('Post not found')
      }

      return pubsub.subscribe('created:comment', postId)
    },
    resolve: (payload: any) => payload
  }
}

export { Subscription as default }