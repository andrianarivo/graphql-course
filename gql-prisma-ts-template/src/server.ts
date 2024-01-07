import { createYoga } from 'graphql-yoga'
import { useJWT } from '@graphql-yoga/plugin-jwt'
import { createServer } from 'http'
import { schema } from './schema'
import { createContext } from './context'

export const yoga = createYoga({
  schema,
  context: createContext,
  plugins: [
    useJWT({
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      signingKey: process.env.AUTH0_SIGNING_KEY ?? '',
    }),
  ],
})

export default createServer(yoga)
