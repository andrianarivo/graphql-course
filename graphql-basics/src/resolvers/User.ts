import { UserResolvers } from '../generated/graphql'

const User: UserResolvers =  {
  posts(parent, args, { db }, info) {
    return db.posts.filter((post) => {
      return (post.author as unknown) === parent.id
    })
  },
  comments(parent, args, { db }, info) {
    return db.comments.filter((comment) => {
      return (comment.author as unknown) === parent.id
    })
  }
}

export { User as default }