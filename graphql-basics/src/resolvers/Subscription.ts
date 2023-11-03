import { SubscriptionResolvers } from '../generated/graphql'
import {Repeater} from "graphql-yoga";

const Subscription: SubscriptionResolvers = {
  count: {
    subscribe(parent, args, {  pubsub }, info) {
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
  }
}

export { Subscription as default }