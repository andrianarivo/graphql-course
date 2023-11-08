import { builder } from '../builder'
import { prisma } from '../db'

builder.queryField('posts', t =>
  t.prismaField({
    type: ['Post'],
    resolve: (query, parent, args, context, info) => {
      return prisma.post.findMany({...query})
    }
  })
)