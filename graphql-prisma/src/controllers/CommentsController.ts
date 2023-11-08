import { builder} from "../builder";
import {prisma} from "../db";

builder.queryField('comments', t =>
  t.prismaField({
    type: ['Comment'],
    resolve: (query, parent, args, context, info) => {
      return prisma.comment.findMany({...query})
    }
  })
)