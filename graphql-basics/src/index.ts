import { createYoga } from 'graphql-yoga'
import { createSchema } from 'graphql-yoga'
import { createServer } from 'http'
import {loadFiles} from "@graphql-tools/load-files";
import {QueryGreetingArgs} from "./generated/graphql"
import {GraphQLResolveInfo} from "graphql"
import { Resolvers } from './generated/graphql'

async function main() {

  // Type definitions (schema)
  const typeDefs = await loadFiles('**/*.graphql')

  // Resolvers
  const resolvers: Resolvers = {
    Query: {
      greeting(parent, args, ctx, info) {
        if(args.name) {
          return `Hello ${args.name}!`
        } else {
          return 'Hello!' // default
        }
      },
      add(_, args) {
        return args.a + args.b
      },
      me() {
        return {
          id: '123098',
          name: 'Mike',
          email: 'mike@example.com',
          age: 28
        }
      },
      post() {
        return {
          id: '092',
          title: 'GraphQL 101',
          body: '',
          published: false
        }
      }
    }
  }

  const schema = createSchema({
    typeDefs,
    resolvers
  })

  const yoga = createYoga({ schema })

  const server = createServer(yoga)

  server.listen(4000, () => {
    console.info('Server is running on http://localhost:4000/graphql')
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})