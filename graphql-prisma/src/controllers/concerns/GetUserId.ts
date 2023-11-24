import {GraphQLError} from "graphql/error";
import {JWTPayload} from "../../types";

export const getUserId = (jwt: JWTPayload, throwError = true): number => {
  if(jwt) {
    return parseInt(jwt.sub.split('|')[1])
  }

  if(throwError) {
    throw new GraphQLError('Unauthorized')
  }

  return -1
}
