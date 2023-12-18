import { builder} from "../builder";
import {prisma} from "../db";
import {GraphQLError} from "graphql/error";
import {MutationType, PubSubCommentEvent, PubSubEvent} from "../pubsub";
import {SubscriptionEvent} from "./concerns/SubscriptionEvent";
import {getUserId} from "./concerns/GetUserId";
import {Sort} from "../models/concerns/Sort";

const CommentOrderByInput = builder.inputType('CommentOrderByInput', {
  fields: (t) => ({
    text: t.field({
      type: Sort,
      required: false
    })
  })
})

builder.queryField('comments', t =>
  t.prismaField({
    type: ['Comment'],
    args: {
      take: t.arg.int({required: false, defaultValue: 10}),
      skip: t.arg.int({required: false, defaultValue: 0}),
      cursorId: t.arg.int({required: false, defaultValue: 1}),
      orderBy: t.arg({
        type: CommentOrderByInput,
        required: false
      })
    },
    resolve: (query, parent, args, context, info) => {
      return prisma.comment.findMany({
        ...query,
        take: args.take!,
        skip: args.skip!,
        cursor: {
          id: args.cursorId!
        },
        orderBy: [args.orderBy as object || {}]
      })
    }
  })
)

const CreateCommentInput = builder.inputType('CreateCommentInput', {
  fields: (t) => ({
    text: t.string({required: true}),
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
    resolve: async (query, parent, args, { pubsub, jwt }, info) => {
      const userId = getUserId(jwt)
      const postExists = await prisma.post.findUnique({
        where: {
          id: args.data.post,
          published: true
        }
      })
      if(!postExists) {
        throw new GraphQLError('Post not found.')
      }
      const comment =  await prisma.comment.create({
        ...query,
        data: {
          text: args.data.text,
          authorId: userId,
          postId: args.data.post
        }
      })

      pubsub.publish('comment', args.data.post, { mutation: MutationType.CREATED, comment })

      return comment
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
    resolve: async (query, parent, args, { pubsub, jwt }, info) => {
      const userId = getUserId(jwt)
      const originalComment = await prisma.comment.findUnique({
        where: {
          id: args.id,
          authorId: userId
        }
      })
      if(!originalComment) {
        throw new GraphQLError('Unable to update comment')
      }
      const comment = await prisma.comment.update({
        ...query,
        where: {
          id: args.id,
          authorId: userId
        },
        data: {
          text: args.data.text || originalComment.text
        }
      })

      pubsub.publish('comment', comment.postId, { mutation: MutationType.UPDATED, comment })

      return comment
    }
  })
)

builder.mutationField('deleteComment', t =>
  t.prismaField({
    type: 'Comment',
    args: {
      id: t.arg.int({required: true})
    },
    resolve: async (query, parent, args, { pubsub, jwt }, info) => {
      const userId = getUserId(jwt)
      const commentExists = await prisma.comment.findUnique({
        where: {
          id: args.id,
          authorId: userId
        }
      })
      if(!commentExists) {
        throw new GraphQLError('Unable to delete comment')
      }
      const comment = await prisma.comment.delete({
        ...query,
        where: {
          id: args.id
        }
      })

      pubsub.publish('comment', comment.postId, { mutation: MutationType.DELETED, comment: comment })

      return comment
    }
  })
)

const SubscriptionCommentEvent = builder.objectRef<PubSubCommentEvent>('SubscriptionCommentEvent')
SubscriptionCommentEvent.implement({
  interfaces: [SubscriptionEvent],
  fields: t => ({
    comment: t.prismaField({
      type: 'Comment',
      nullable: true,
      resolve: (query, event) => {
        return prisma.comment.findUnique({
          where: {
            id: event.comment.id
          }
        })
      }
    })
  })
})

builder.subscriptionField('comment', t =>
    t.field({
      type: SubscriptionCommentEvent,
      nullable: true,
      args: {
        postId: t.arg.int({required: true})
      },
      subscribe: (parent, args, { pubsub }, info) =>
          pubsub.subscribe('comment', args.postId)
      ,
      resolve: (event) => event
    })
)
