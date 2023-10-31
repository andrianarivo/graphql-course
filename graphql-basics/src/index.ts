import { createYoga } from 'graphql-yoga'
import { createSchema } from 'graphql-yoga'
import { createServer } from 'http'

// Type definitions (schema)
const typeDefs = `
  type Query {
    hello: String!
    name: String!
    location: String!
    bio: String!
  }
`

// Resolvers
const resolvers = {
  Query: {
    hello() {
      return 'This is my first query!'
    },
    name() {
      return 'David Andrianarvio'
    },
    location() {
      return 'Madagascar'
    },
    bio() {
      return 'I am a 28 years old professional from Madagascar'
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