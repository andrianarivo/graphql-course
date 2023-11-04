import {GraphQLError} from "graphql/error"
import {v4 as uuidv4} from "uuid"
import {MutationResolvers, User, Post, Comment} from "../generated/graphql"

const Mutation: MutationResolvers =  {
  createUser(parent, args, { db }, info) {
    const emailTaken = db.users.some((user) => user.email === args.data.email)
    if(emailTaken) {
      throw new GraphQLError('Email taken.')
    }

    const user: User = {
      id: uuidv4(),
      comments: [],
      posts: [],
      ...args.data
    }
    db.users.push(user)

    return user
  },
  deleteUser(parent, args, { db }, info) {
    const userIndex = db.users.findIndex((user) => user.id === args.id)
    if (userIndex === -1) {
      throw new GraphQLError('User not found.')
    }

    const deletedUsers = db.users.splice(userIndex, 1)

    db.posts = db.posts.filter((post) => {
      const match = (post.author as any) === args.id

      if(match) {
        db.comments = db.comments.filter((comment) => (comment.post as any) !== post.id)
      }

      return !match
    })

    return deletedUsers[0]
  },
  updateUser(parent, args, { db }, info) {
    const { id, data } = args
    const user = db.users.find((user) => user.id === id)
    if(!user) {
      throw new GraphQLError('User not found.')
    }

    if(typeof data.email === 'string') {
      const emailTaken = db.users.some((user) => user.email === data.email)
      if(emailTaken) {
        throw new GraphQLError('Email taken.')
      }

      user.email = data.email
    }

    if(typeof data.name === 'string') {
      user.name = data.name
    }

    if (typeof data.age !== 'undefined') {
      user.age = data.age
    }

    return user
  },
  createPost(parent, args, { db, pubsub }, info) {
    const userExists = db.users.some((user) => user.id === args.data.author)
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
    db.posts.push(post)
    if(post.published) {
      pubsub.publish('post', { mutation: 'CREATED', data: post })
    }

    return post
  },
  deletePost(parent, args, { db, pubsub }, info) {
    const postIndex = db.posts.findIndex((post) => post.id === args.id)
    if (postIndex === -1) {
      throw new GraphQLError('Post not found.')
    }

    const [deletedPost] = db.posts.splice(postIndex, 1)

    db.comments = db.comments.filter((comment) => (comment.post as any) !== args.id)

    if(deletedPost.published) {
      pubsub.publish('post', { mutation: 'DELETED', data: deletedPost })
    }

    return deletedPost
  },
  updatePost(parent, args, { db, pubsub }, info) {
    const { id, data } = args
    const post = db.posts.find((post) => post.id === id)
    const originalPost: Post = structuredClone(post) as Post

    if(!post) {
      throw new GraphQLError('Post not found.')
    }

    if(typeof data.title === 'string') {
      post.title = data.title
    }

    if(typeof data.body === 'string') {
      post.body = data.body
    }

    if (typeof data.published === 'boolean') {
      post.published = data.published

      if(originalPost.published && !post.published) {
        pubsub.publish('post', { mutation: 'DELETED', data: originalPost })
      } else if(!originalPost.published && post.published) {
        pubsub.publish('post', { mutation: 'CREATED', data: post })
      }
    } else if(post.published) {
      pubsub.publish('post', { mutation: 'UPDATED', data: post })
    }

    return post
  },
  createComment(parent, args, { db, pubsub }, info) {
    const userExists = db.users.some((user) => user.id === args.data.author)
    if(!userExists) {
      throw new GraphQLError('User not found.')
    }

    const postExists = db.posts.some((post) => post.id === args.data.post && post.published)
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
    db.comments.push(comment)
    pubsub.publish('comment', args.data.post, { mutation: "CREATED", data: comment })

    return comment
  },
  deleteComment(parent, args, { db, pubsub }, info) {
    const commentIndex = db.comments.findIndex((comment) => comment.id === args.id)
    if (commentIndex === -1) {
      throw new GraphQLError('Comment not found.')
    }

    const [deletedComment] = db.comments.splice(commentIndex, 1)
    pubsub.publish('comment', (deletedComment.post as any), { mutation: "DELETED", data: deletedComment })

    return deletedComment
  },
  updateComment(parent, args, { db, pubsub }, info) {
    const { id, data } = args
    const comment = db.comments.find((comment) => comment.id === id)
    if(!comment) {
      throw new GraphQLError('Comment not found.')
    }

    if(typeof data.text === 'string') {
      comment.text = data.text
    }
    pubsub.publish('comment', (comment.post as any), { mutation: "UPDATED", data: comment })

    return comment
  }
}

export { Mutation as default }