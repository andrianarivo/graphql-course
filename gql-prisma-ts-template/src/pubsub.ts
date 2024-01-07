import { createPubSub } from 'graphql-yoga'

export enum MutationType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
}

export interface PubSubEvent {
  mutation: MutationType
}

export type PubSubEvents = Record<string, [number | string, PubSubEvent] | [PubSubEvent]>

export const pubsub = createPubSub<PubSubEvents>({})
