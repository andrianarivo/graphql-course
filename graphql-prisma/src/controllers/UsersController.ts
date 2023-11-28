import {builder} from '../builder'
import {prisma} from '../db'
import {GraphQLError} from "graphql/error"
import bcrypt from "bcryptjs";
import {getUserId} from "./concerns/GetUserId";
import hashPassword from "./concerns/HashPassword";

builder.queryField('users', t =>
  t.prismaField({
    type: ['User'],
    resolve: (query, parent, args, context, info) => {
      return prisma.user.findMany({...query})
    }
  })
)

builder.queryField('me', t =>
  t.prismaField({
    type: 'User',
    resolve: (query, parent, args, { jwt }, info) => {
      const userId = getUserId(jwt)

      return prisma.user.findUniqueOrThrow({
        where: {
          id: userId
        }
      })
    }
  })
)

const CreateUserInput = builder.inputType('CreateUserInput', {
  fields: (t) => ({
    name: t.string({required: true}),
    email: t.string({required: true}),
    age: t.int({required: true}),
    password: t.string({required: true})
  })
})

builder.mutationField('createUser', t =>
  t.prismaField({
    type: 'User',
    args: {
      data: t.arg({
        type: CreateUserInput,
        required: true
      })
    },
    resolve: async (query, parent, args, context, info) => {
      const pwdDigest = await hashPassword(args.data.password)
      return prisma.user.create({
        ...query,
        data: {
          name: args.data.name,
          email: args.data.email,
          age: args.data.age,
          password: pwdDigest
        }
      })
    }
  })
)

const UpdateUserInput = builder.inputType('UpdateUserInput', {
  fields: (t) => ({
    name: t.string({required: false}),
    email: t.string({required: false}),
    password: t.string({required: false}),
    age: t.int({required: false})
  })
})

builder.mutationField('updateUser', t =>
  t.prismaField({
    type: 'User',
    args: {
      data: t.arg({
        type: UpdateUserInput,
        required: true
      })
    },
    resolve: async (query, parent, args, { jwt }, info) => {
      const userId = getUserId(jwt)
      if(args.data.password) {
        args.data.password = await hashPassword(args.data.password)
      }
      const originalUser = await prisma.user.findUnique({
        where: {
          id: userId
        }
      })
      if(!originalUser) {
        throw new GraphQLError('User not found.')
      }
      return prisma.user.update({
        where: {
          id: userId
        },
        data: {
          name: args.data.name || originalUser.name,
          email: args.data.email || originalUser.email,
          password: args.data.password || originalUser.password,
          age: args.data.age || originalUser.age
        }
      })
    }
  })
)

builder.mutationField('deleteUser', t =>
  t.prismaField({
    type: 'User',
    resolve: async (query, parent, args, {jwt}, info) => {
      const userId = getUserId(jwt)
      const originalUser = await prisma.user.findUnique({
        where: {
          id: userId
        }
      })
      if(!originalUser) {
        throw new GraphQLError('User not found.')
      }
      return prisma.user.delete({
        where: {
          id: userId
        }
      })
    }
  })
)
