import { PostResolvers } from '../generated/graphql'

const Post: PostResolvers =  {
  author(parent, args, { db }, info) {
    return db.users.find((user) => {
      return user.id === (parent.author as unknown)
    })!
  },
  comments(parent, args, { db }, info) {
    return db.comments.filter((comment) => {
      return (comment.post as unknown) === parent.id
    })
  }
}

export { Post as default}