import { builder } from '../builder'
import {getUserId} from "../controllers/concerns/GetUserId";

builder.prismaObject('User', {
  fields: t => ({
      id: t.exposeID('id'),
      name: t.exposeString('name', { nullable: true }),
      email: t.string({
        resolve: (user, args, { jwt }, info) => {
          const userId = getUserId(jwt, false)
          if(userId === user.id) {
            return user.email
          }
          return ''
        }
      }),
      age: t.exposeInt('age'),
      posts: t.relation('posts'),
      comments: t.relation('comments')
  })
})