import { createPubSub } from 'graphql-yoga';
import { Post, Comment } from '@prisma/client';

export enum MutationType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
}

export interface PubSubEvent {
  mutation: MutationType
}

export interface PubSubCommentEvent extends PubSubEvent {
  comment: Comment
}

export interface PubSubPostEvent extends PubSubEvent {
  post: Post
}

export interface PubSubEvents
  extends Record<string, [number | string, PubSubEvent] | [PubSubEvent]> {
  comment: [number | string, PubSubCommentEvent]
  post: [PubSubPostEvent]
}

export const pubsub = createPubSub<PubSubEvents>({});
