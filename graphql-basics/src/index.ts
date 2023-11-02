import { createYoga } from 'graphql-yoga'
import { createSchema } from 'graphql-yoga'
import { createServer } from 'http'

// Type definitions (schema)
const typeDefs = `
  type Query {
    id: ID!
    title: String!
    price: Float!
    releaseYear: Int
    rating: Float
    inStock: Boolean!
  }
`

// Resolvers
const resolvers = {
  Query: {
    id() {
      return 'abc123'
    },
    title() {
      return 'The War of Art'
    },
    price() {
      return 12.99
    },
    releaseYear() {
      return null
    },
    rating() {
      return 3.7
    },
    inStock() {
      return true
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