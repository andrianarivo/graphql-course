import {createYoga} from 'graphql-yoga'
import {createServer} from 'http'
import {schema} from "./schema"
import {createContext} from "./context"
import {useJWT} from "@graphql-yoga/plugin-jwt";

async function main() {

  const yoga = createYoga({
    schema,
    context: createContext,
    plugins: [
      useJWT({
        audience: process.env.AUTH0_AUDIENCE,
        issuer: `https://${process.env.AUTH0_DOMAIN}/`,
        signingKey: process.env.AUTH0_SIGNING_KEY!
      })
    ]
  })

  const server = createServer(yoga)

  server.listen(4000, () => {
    console.info('Server is running on http://localhost:4000/graphql')
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})