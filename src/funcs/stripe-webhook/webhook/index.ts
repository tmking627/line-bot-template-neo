import { Request, Response } from 'express'

import { signatureMiddleware } from '../middleware/signature.middleware'
import { customerSubscriptionDeletedHandler } from './customer.subscription.deleted'
import { customerSubscriptionUpdatedHandler } from './customer.subscription.updated'
import { paymentIntentSucceededHandler } from './payment_intent.succeded'

export const stripeWebhookHandlers = async (req: Request, res: Response) => {
  try {
    const event = signatureMiddleware(req)

    switch (event.type) {
      case 'customer.subscription.updated':
        await customerSubscriptionUpdatedHandler(event)
        break
      case 'customer.subscription.deleted':
        await customerSubscriptionDeletedHandler(event)
        break
      case 'payment_intent.succeeded':
        //サブスクも単発課金もこの'payment_intent.succeeded'に該当するので、課金の種類を判別するためにdescriptionを使う
        // @ts-ignore
        if (event.data.object.description !== 'Subscription creation') {
          // @ts-ignore
          await paymentIntentSucceededHandler({ customerId: event.data.object.customer })
        }
        break
    }

    res.status(200).send('success').end()
  } catch (err) {
    console.error(err)
    res.status(500).send('error').end()
  }
}
