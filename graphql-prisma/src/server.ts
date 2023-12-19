import {createYoga} from "graphql-yoga";
import {schema} from "./schema";
import {createContext} from "./context";
import {useJWT} from "@graphql-yoga/plugin-jwt";
import {createServer} from "http";
import {buildHTTPExecutor} from "@graphql-tools/executor-http";

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

export { server as default, yoga  }