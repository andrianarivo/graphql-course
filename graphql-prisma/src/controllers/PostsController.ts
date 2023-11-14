import { builder } from '../builder'
import { prisma } from '../db'
import {GraphQLError} from "graphql/error"
import {MutationType, PubSubPostEvent} from "../pubsub"
import {SubscriptionEvent} from "./concerns/SubscriptionEvent";

builder.queryField('posts', t =>
  t.prismaField({
    type: ['Post'],
    resolve: (query, parent, args, { currentUser }, info) => {
      console.log(currentUser)
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
    resolve: async (query, parent, args, {pubsub}, info) => {
      const userExists = await prisma.user.findUnique({
        where: {
          id: args.data.author
        }
      })
      if(!userExists) {
        throw new GraphQLError('User not found.')
      }
      const post = await prisma.post.create({
        ...query,
        data: {
          title: args.data.title,
          body: args.data.body || '',
          published: args.data.published || false,
          authorId: args.data.author
        }
      })

      if(post.published) {
        pubsub.publish('post', { mutation: MutationType.CREATED, post })
      }

      return post
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
    resolve: async (query, parent, args, {pubsub}, info) => {
      const originalPost = await prisma.post.findUnique({
        where: {
          id: args.id
        }
      })
      if(!originalPost) {
        throw new GraphQLError('Post not found.')
      }
      const post = await prisma.post.update({
        ...query,
        where: {
          id: args.id
        },
        data: {
          title: args.data.title || originalPost.title,
          body: args.data.body || originalPost.body,
          published: args.data.published ?? originalPost.published
        }
      })

      if(originalPost.published && !post.published) {
        pubsub.publish('post', { mutation: MutationType.DELETED, post: originalPost })
      } else if(!originalPost.published && post.published) {
        pubsub.publish('post', { mutation: MutationType.CREATED, post })
      } else {
        pubsub.publish('post', { mutation: MutationType.UPDATED, post })
      }

      return post
    }
  })
)

builder.mutationField('deletePost', t =>
  t.prismaField({
    type: 'Post',
    args: {
      id: t.arg.int({required: true})
    },
    resolve: async (query, parent, args, { pubsub }, info) => {
      const originalPost = await prisma.post.findUnique({
        where: {
          id: args.id
        }
      })
      if(!originalPost) {
        throw new GraphQLError('Post not found.')
      }
      const post = await prisma.post.delete({
        ...query,
        where: {
          id: args.id
        }
      })

      pubsub.publish('post', { mutation: MutationType.DELETED, post: originalPost })

      return post
    }
  })
)

const SubscriptionPostEvent = builder.objectRef<PubSubPostEvent>('SubscriptionPostEvent')
SubscriptionPostEvent.implement({
  interfaces: [SubscriptionEvent],
  fields: t => ({
    post: t.prismaField({
      type: 'Post',
      nullable: true,
      resolve: (query, event) => {
        return prisma.post.findUnique({
          where: {
            id: event.post.id
          }
        })
      }
    })
  })
})

builder.subscriptionField('post', t =>
    t.field({
      type: SubscriptionPostEvent,
      nullable: true,
      subscribe: (parent, args, { pubsub }, info) =>
          pubsub.subscribe('post')
      ,
      resolve: (payload) => payload
    })
)
