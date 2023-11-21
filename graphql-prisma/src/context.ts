import { YogaInitialContext } from 'graphql-yoga'
import isTokenValid from "./validate";
import {GraphQLContext} from "./types";
import {pubsub} from "./pubsub";
import axios from "axios";
import {Auth0User} from "./controllers/concerns/GetUserId";

export async function createContext(initialContext: YogaInitialContext): Promise<GraphQLContext> {
  let currentUser: Auth0User = null
  try {
    const bearerToken = initialContext.request.headers.get('authorization') as string
    const decoded = await isTokenValid(bearerToken)
    if(decoded) {
      const response = await axios.get(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
        headers: {
          authorization: bearerToken
        }
      })
      currentUser = response.data
    }
  } catch (e) {
    console.error(e)
  }
  return {
    pubsub,
    currentUser: currentUser
  }
}