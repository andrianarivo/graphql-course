import { CommentResolvers } from '../generated/graphql'

const Comment: CommentResolvers = {
  author(parent, args, { db }, info) {
    return db.users.find((user) => user.id === (parent.author as unknown))!
  },
  post(parent, args, { db }, info) {
    return db.posts.find((post) => post.id === (parent.post as unknown))!
  }
}

export { Comment as default }