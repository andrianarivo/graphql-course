import { builder } from '../builder'
import { prisma } from '../db'
import {GraphQLError} from "graphql/error";

builder.queryField('posts', t =>
  t.prismaField({
    type: ['Post'],
    resolve: (query, parent, args, context, info) => {
      return prisma.post.findMany({...query})
    }
  })
)

const CreatePostInput = builder.inputType('CreatePostInput', {
  fields: (t) => ({
    title: t.string({required: true}),
    body: t.string({required: false}),
    published: t.boolean({required: false}),
    author: t.int({required: true})
  })
})

builder.mutationField('createPost', t =>
  t.prismaField({
    type: 'Post',
    args: {
      data: t.arg({
        type: CreatePostInput,
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
      return prisma.post.create({
        ...query,
        data: {
          title: args.data.title,
          body: args.data.body || '',
          published: args.data.published || false,
          authorId: args.data.author
        }
      })
    }
  })
)

const UpdatePostInput = builder.inputType('UpdatePostInput', {
  fields: (t) => ({
    title: t.string({required: false}),
    body: t.string({required: false}),
    published: t.boolean({required: false})
  })
})

builder.mutationField('updatePost', t =>
  t.prismaField({
    type: 'Post',
    args: {
      id: t.arg.int({required: true}),
      data: t.arg({
        type: UpdatePostInput,
        required: true
      })
    },
    resolve: async (query, parent, args, context, info) => {
      const originalPost = await prisma.post.findUnique({
        where: {
          id: args.id
        }
      })
      if(!originalPost) {
        throw new GraphQLError('Post not found.')
      }
      return prisma.post.update({
        ...query,
        where: {
          id: args.id
        },
        data: {
          title: args.data.title || originalPost.title,
          body: args.data.body || originalPost.body,
          published: args.data.published || originalPost.published
        }
      })
    }
  })
)

builder.mutationField('deletePost', t =>
  t.prismaField({
    type: 'Post',
    args: {
      id: t.arg.int({required: true})
    },
    resolve: async (query, parent, args, context, info) => {
      const originalPost = await prisma.post.findUnique({
        where: {
          id: args.id
        }
      })
      if(!originalPost) {
        throw new GraphQLError('Post not found.')
      }
      return prisma.post.delete({
        ...query,
        where: {
          id: args.id
        }
      })
    }
  })
)