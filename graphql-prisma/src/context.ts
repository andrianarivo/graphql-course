import { YogaInitialContext } from 'graphql-yoga'
import isTokenValid from "./validate";
import {GraphQLContext} from "./types";
import {pubsub} from "./pubsub";

export async function createContext(initialContext: YogaInitialContext): Promise<GraphQLContext> {
  let currentUser
  try {
    currentUser = await isTokenValid(initialContext.request.headers.get('authorization') as string)
  } catch (e) {
    console.error(e)
  }
  return {
    pubsub,
    currentUser: currentUser
  }
}