import {createSchema, createYoga} from 'graphql-yoga'
import {createServer} from 'http'
import {loadFiles} from "@graphql-tools/load-files";
import {Resolvers} from './generated/graphql'

async function main() {

  // Demo user data
  const users = [
    {
      id: '1',
      name: 'Andrew',
      email: 'andrew@example.com',
      age: 27
    },
    {
      id: '2',
      name: 'Sarah',
      email: 'sarah@example.com',
    },
    {
      id: '3',
      name: 'Mike',
      email: 'mike@example.com',
    }
  ]
  const posts = [
    {
      id: '10',
      title: 'GraphQL 101',
      body: 'This is how to use GraphQL...',
      published: true
    },
    {
      id: '11',
      title: 'GraphQL 201',
      body: 'This is an advanced GraphQL post...',
      published: true
    },
    {
      id: '12',
      title: 'Programming Music',
      body: '',
      published: false
    }
  ]

  // Type definitions (schema)
  const typeDefs = await loadFiles('**/*.graphql')

  // Resolvers
  const resolvers: Resolvers = {
    Query: {
      users(parent, args, ctx, info) {
        if(!args.query) {
          return users
        }
        return users.filter((user) =>
            user.name.toLowerCase().includes(args.query!.toLowerCase())
        )
      },
      posts(parent, args, ctx, info) {
        if(!args.query) {
          return posts
        }
        return posts.filter((post) => {
              const isTitleMatch = post.title.toLowerCase().includes(args.query!.toLowerCase())
              const isBodyMatch = post.body.toLowerCase().includes(args.query!.toLowerCase())
              return isTitleMatch || isBodyMatch
            }
        )
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