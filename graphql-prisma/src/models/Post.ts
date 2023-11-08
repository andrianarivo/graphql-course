import { builder } from '../builder'

builder.prismaObject('Post', {
  fields: t => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    body: t.exposeString('body', {nullable: true}),
    published: t.exposeBoolean('published'),
    author: t.relation('author'),
    comments: t.relation('comments')
  })
})