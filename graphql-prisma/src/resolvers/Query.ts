import {QueryResolvers, User} from '../generated/graphql'

const Query: QueryResolvers = {
  users: async (parent, args, { db, prisma }, info) => {
    if(!args.query) {
      return prisma.user.findMany()
    }
    return prisma.user.findMany()
  },
  posts(parent, args, { db }, info) {
    if(!args.query) {
      return db.posts
    }
    return db.posts.filter((post) => {
          const isTitleMatch = post.title.toLowerCase().includes(args.query!.toLowerCase())
          const isBodyMatch = post.body.toLowerCase().includes(args.query!.toLowerCase())
          return isTitleMatch || isBodyMatch
        }
    )
  },
  comments(parent, args, { db }, info) {
    return db.comments
  },
  me(parent, args, { db }, info) {
    return db.users[1]
  }
}

export { Query as default }