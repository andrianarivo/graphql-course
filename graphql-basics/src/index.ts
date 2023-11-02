import {createSchema, createYoga} from 'graphql-yoga'
import {createServer} from 'http'
import {loadFiles} from "@graphql-tools/load-files"
import {Comment, Post, Resolvers, User} from './generated/graphql'
import {v4 as uuidv4} from 'uuid'
import {GraphQLError} from "graphql/error";

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
  let posts: Post[] = [
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
  let comments: Comment[] = [
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
          return user.id === (parent.author as unknown)
        })!
      },
      comments(parent, args, ctx, info) {
        return comments.filter((comment) => {
          return (comment.post as unknown) === parent.id
        })
      }
    },
    User: {
      posts(parent, args, ctx, info) {
        return posts.filter((post) => {
          return (post.author as unknown) === parent.id
        })
      },
      comments(parent, args, ctx, info) {
        return comments.filter((comment) => {
          return (comment.author as unknown) === parent.id
        })
      }
    },
    Comment: {
      author(parent, args, ctx, info) {
        return users.find((user) => user.id === (parent.author as unknown))!
      },
      post(parent, args, ctx, info) {
        return posts.find((post) => post.id === (parent.post as unknown))!
      }
    },
    Mutation: {
      createUser(parent, args, ctx, info) {
        const emailTaken = users.some((user) => user.email === args.data.email)
        if(emailTaken) {
          throw new GraphQLError('Email taken.')
        }

        const user: User = {
          id: uuidv4(),
          comments: [],
          posts: [],
          ...args.data
        }
        users.push(user)

        return user
      },
      deleteUser(parent, args, ctx, info) {
        const userIndex = users.findIndex((user) => user.id === args.id)
        if (userIndex === -1) {
          throw new GraphQLError('User not found.')
        }

        const deletedUsers = users.splice(userIndex, 1)

        posts = posts.filter((post) => {
          const match = (post.author as unknown) === args.id

          if(match) {
            comments = comments.filter((comment) => (comment.post as unknown) !== post.id)
          }

          return !match
        })

        return deletedUsers[0]
      },
      deletePost(parent, args, ctx, info) {
        const postIndex = posts.findIndex((post) => post.id === args.id)
        if (postIndex === -1) {
          throw new GraphQLError('Post not found.')
        }

        const deletedPosts = posts.splice(postIndex, 1)

        comments = comments.filter((comment) => (comment.post as unknown) !== args.id)

        return deletedPosts[0]
      },
      createPost(parent, args, ctx, info) {
        const userExists = users.some((user) => user.id === args.data.author)
        if(!userExists) {
          throw new GraphQLError('User not found.')
        }

        const post: Post = {
          id: uuidv4(),
          comments: [],
          title: args.data.title,
          body: args.data.body,
          published: args.data.published,
          // @ts-ignore
          author: args.data.author
        }
        posts.push(post)

        return post
      },
      createComment(parent, args, ctx, info) {
        const userExists = users.some((user) => user.id === args.data.author)
        if(!userExists) {
          throw new GraphQLError('User not found.')
        }

        const postExists = posts.some((post) => post.id === args.data.post && post.published)
        if(!postExists) {
          throw new GraphQLError('Post not found.')
        }

        const comment: Comment = {
          id: uuidv4(),
          text: args.data.text,
          // @ts-ignore
          post: args.data.post,
          // @ts-ignore
          author: args.data.author
        }
        comments.push(comment)

        return comment
      },
      deleteComment(parent, args, ctx, info) {
        const commentIndex = comments.findIndex((comment) => comment.id === args.id)
        if (commentIndex === -1) {
          throw new GraphQLError('Comment not found.')
        }

        const deletedComments = comments.splice(commentIndex, 1)

        return deletedComments[0]
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