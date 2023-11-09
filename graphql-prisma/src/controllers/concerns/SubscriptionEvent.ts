import {builder} from "../../builder";
import {PubSubEvent} from "../../pubsub";

export const SubscriptionEvent = builder.interfaceRef<PubSubEvent>('SubscriptionEvent').implement({
  fields: (t) => ({
    mutation: t.exposeString('mutation'),
  }),
});

