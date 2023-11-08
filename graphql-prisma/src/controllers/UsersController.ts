import { builder } from '../builder'
import { prisma } from '../db'

builder.queryField('users', t =>
  t.prismaField({
     type: ['User'],
     resolve: (query, parent, args, context, info) => {
       return prisma.user.findMany({...query})
     }
  })
)