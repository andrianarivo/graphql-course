import {createSchema, createYoga} from 'graphql-yoga'
import {createServer} from 'http'
import {loadFiles} from "@graphql-tools/load-files";
import {Resolvers, Post, Comment, User} from './generated/graphql'

async function main() {

  // Demo user data
  const users: User[] = [
    {
      id: '1',
      name: 'Andrew',
      email: 'andrew@example.com',
      age: 27,
      posts: [],
      comments: []
    },
    {
      id: '2',
      name: 'Sarah',
      email: 'sarah@example.com',
      posts: [],
      comments: []
    },
    {
      id: '3',
      name: 'Mike',
      email: 'mike@example.com',
      posts: [],
      comments: []
    }
  ]
  const posts: Post[] = [
    {
      id: '10',
      title: 'GraphQL 101',
      body: 'This is how to use GraphQL...',
      published: true,
      // @ts-ignore
      author: '1'
    },
    {
      id: '11',
      title: 'GraphQL 201',
      body: 'This is an advanced GraphQL post...',
      published: true,
      // @ts-ignore
      author: '1'
    },
    {
      id: '12',
      title: 'Programming Music',
      body: '',
      published: false,
      // @ts-ignore
      author: '3'
    }
  ]
  const comments: Comment[] = [
    {
      id: '102',
      text: 'This worked well for me. Thanks!',
      // @ts-ignore
      author: '3',
      // @ts-ignore
      post: '10',
    },
    {
      id: '103',
      text: 'Glad you enjoyed it.',
      // @ts-ignore
      author: '1',
      // @ts-ignore
      post: '10',
    },
    {
      id: '104',
      text: 'This did not work.',
      // @ts-ignore
      author: '2',
      // @ts-ignore
      post: '11'
    },
    {
      id: '105',
      text: 'Nevermind. I got it to work.',
      // @ts-ignore
      author: '1',
      // @ts-ignore
      post: '11'
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
      comments() {
        return comments
      },
      me() {
        return users[1]
      },
      post() {
        return posts[1]
      }
    },
    Post: {
      author(parent, args, ctx, info) {
        return users.find((user) => {
          // @ts-ignore
          return user.id === parent.author
        })!
      },
      comments(parent, args, ctx, info) {
        return comments.filter((comment) => {
          // @ts-ignore
          return comment.post === parent.id
        })
      }
    },
    User: {
      posts(parent, args, ctx, info) {
        return posts.filter((post) => {
          // @ts-ignore
          return post.author === parent.id
        })
      },
      comments(parent, args, ctx, info) {
        return comments.filter((comment) => {
          // @ts-ignore
          return comment.author === parent.id
        })
      }
    },
    Comment: {
      author(parent, args, ctx, info) {
        return users.find((user) => {
          // @ts-ignore
          return user.id === parent.author
        })!
      },
      post(parent, args, ctx, info) {
        return posts.find((post) => {
          // @ts-ignore
          return post.id === parent.post
        })!
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