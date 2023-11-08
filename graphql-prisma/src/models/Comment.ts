import { builder } from '../builder'

builder.prismaObject('Comment', {
  fields: t => ({
    id: t.exposeID('id'),
    text: t.exposeString('text'),
    author: t.relation('author'),
    post: t.relation('post')
  })
})