import { builder } from '../builder'
import { prisma } from '../db'
import {GraphQLError} from "graphql/error"
import {MutationType, PubSubPostEvent} from "../pubsub"
import {SubscriptionEvent} from "./concerns/SubscriptionEvent";
import {getUserId} from "./concerns/GetUserId";

builder.queryField('posts', t =>
  t.prismaField({
    type: ['Post'],
    resolve: (query, parent, args, { currentUser }, info) => {
      return prisma.post.findMany({...query})
    }
  })
)

builder.queryField('post', t =>
  t.prismaField({
    type: 'Post',
    args: {
      id: t.arg.int({required: true})
    },
    resolve: async (query, parent, args, { currentUser }, info) => {
      const userId = getUserId(currentUser, false)
      const post = await prisma.post.findUnique({
        where: {
          id: args.id,
          OR: [{
            published: true,
          }, {
            authorId: userId
          }]
        }
      })

      if(!post) {
        throw new GraphQLError('Post not found.')
      }

      return post
    }
  })
)

const CreatePostInput = builder.inputType('CreatePostInput', {
  fields: (t) => ({
    title: t.string({required: true}),
    body: t.string({required: false}),
    published: t.boolean({required: false}),
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
    resolve: async (query, parent, args, {pubsub, currentUser}, info) => {
      const userId = getUserId(currentUser)
      const post = await prisma.post.create({
        ...query,
        data: {
          title: args.data.title,
          body: args.data.body || '',
          published: args.data.published || false,
          authorId: userId
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
    resolve: async (query, parent, args, {pubsub, currentUser}, info) => {
      const userId = getUserId(currentUser)
      const originalPost = await prisma.post.findUnique({
        where: {
          id: args.id,
          authorId: userId
        }
      })
      if(!originalPost) {
        throw new GraphQLError('Unable to update post.')
      }
      const post = await prisma.post.update({
        ...query,
        where: {
          id: args.id,
          authorId: userId
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
    resolve: async (query, parent, args, { pubsub, currentUser }, info) => {
      const userId = getUserId(currentUser)
      const originalPost = await prisma.post.findUnique({
        where: {
          id: args.id,
          authorId: userId
        }
      })
      if(!originalPost) {
        throw new GraphQLError('Unable to delete post.')
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
