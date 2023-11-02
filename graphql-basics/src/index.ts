import { createYoga } from 'graphql-yoga'
import { createSchema } from 'graphql-yoga'
import { createServer } from 'http'

// Type definitions (schema)
const typeDefs = `
  type Query {
    me: User!
    post: Post!
  }
  
  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
  }
  
  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
  }
`

// Resolvers
const resolvers = {
  Query: {
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