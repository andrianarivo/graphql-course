import { builder} from "../builder";
import {prisma} from "../db";
import {GraphQLError} from "graphql/error";

builder.queryField('comments', t =>
  t.prismaField({
    type: ['Comment'],
    resolve: (query, parent, args, context, info) => {
      return prisma.comment.findMany({...query})
    }
  })
)

const CreateCommentInput = builder.inputType('CreateCommentInput', {
  fields: (t) => ({
    text: t.string({required: true}),
    author: t.int({required: true}),
    post: t.int({required: true})
  })
})

builder.mutationField('createComment', t =>
  t.prismaField({
    type: 'Comment',
    args: {
      data: t.arg({
        type: CreateCommentInput,
        required: true
      })
    },
    resolve: async (query, parent, args, context, info) => {
      const userExists = await prisma.user.findUnique({
        where: {
          id: args.data.author
        }
      })
      if(!userExists) {
        throw new GraphQLError('User not found.')
      }
      const postExists = await prisma.post.findUnique({
        where: {
          id: args.data.post
        }
      })
      if(!postExists) {
        throw new GraphQLError('Post not found.')
      }
      return prisma.comment.create({
        ...query,
        data: {
          text: args.data.text,
          authorId: args.data.author,
          postId: args.data.post
        }
      })
    }
  })
)

const UpdateCommentInput = builder.inputType('UpdateCommentInput', {
  fields: (t) => ({
    text: t.string({required: false})
  })
})

builder.mutationField('updateComment', t =>
  t.prismaField({
    type: 'Comment',
    args: {
      id: t.arg.int({required: true}),
      data: t.arg({
        type: UpdateCommentInput,
        required: true
      })
    },
    resolve: async (query, parent, args, context, info) => {
      const originalComment = await prisma.comment.findUnique({
        where: {
          id: args.id
        }
      })
      if(!originalComment) {
        throw new GraphQLError('Comment not found.')
      }
      return prisma.comment.update({
        ...query,
        where: {
          id: args.id
        },
        data: {
          text: args.data.text || originalComment.text
        }
      })
    }
  })
)

builder.mutationField('deleteComment', t =>
  t.prismaField({
    type: 'Comment',
    args: {
      id: t.arg.int({required: true})
    },
    resolve: async (query, parent, args, context, info) => {
      const comment = await prisma.comment.findUnique({
        where: {
          id: args.id
        }
      })
      if(!comment) {
        throw new GraphQLError('Comment not found.')
      }
      return prisma.comment.delete({
        ...query,
        where: {
          id: args.id
        }
      })
    }
  })
)