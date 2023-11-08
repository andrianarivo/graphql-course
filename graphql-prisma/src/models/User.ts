import { builder } from '../builder'

builder.prismaObject('User', {
  fields: t => ({
      id: t.exposeID('id'),
      name: t.exposeString('name', { nullable: true }),
      email: t.exposeString('email'),
      age: t.exposeInt('age'),
      posts: t.relation('posts'),
      comments: t.relation('comments')
  })
})