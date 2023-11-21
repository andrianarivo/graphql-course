import {GraphQLError} from "graphql/error";

export type Auth0User = {
  sub: string,
  nickname: string,
  name: string,
  picture: string,
  updated_at: string,
  email: string,
} | null | undefined

export const getUserId = (currentUser: Auth0User | null | undefined): number => {
  if(!currentUser) {
    throw new GraphQLError('Unauthorized')
  }
  return parseInt(currentUser.sub.split('|')[1])
}
