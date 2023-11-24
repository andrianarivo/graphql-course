import { YogaInitialContext } from 'graphql-yoga'
import {GraphQLContext} from "./types";
import {pubsub} from "./pubsub";

export async function createContext(initialContext: YogaInitialContext): Promise<GraphQLContext> {
  return {
    pubsub,
  }
}