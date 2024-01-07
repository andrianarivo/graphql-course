import { GraphQLContext } from './types'
import { pubsub } from './pubsub'

export async function createContext(): Promise<GraphQLContext> {
  return {
    pubsub,
  }
}
