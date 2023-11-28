import bcrypt from "bcryptjs";
import {GraphQLError} from "graphql/error";

const hashPassword = (password: string) => {
  if(password.length < 8) {
    throw new GraphQLError('Password must be 8 characters or longer')
  }
  return bcrypt.hash(password, 10)
}

export default hashPassword