import { Stripe } from 'stripe'

import { lineClient } from '~/clients/line.client'
import { stripeClient } from '~/clients/stripe.client'
import { getRichMenuId } from '~/domains/richmenu.domain'
import { getUserByUserId } from '~/domains/user.domain'
import { updateUserDb } from '~/libs/firebase/firestore/user'
import { makeReplyMessage } from '~/utils/line.util'

interface Props {
  customerId: string
  subscriptionStatus: Stripe.Subscription.Status | undefined
  beforeSubscriptionStatus: Stripe.Subscription.Status | undefined
}

export const customerSubscriptionUpdatedController = async (props: Props): Promise<void> => {
  const { customerId, subscriptionStatus, beforeSubscriptionStatus } = props

  // stripe customer check.
  const customer = await stripeClient.customers.retrieve(customerId)
  if (customer.deleted) {
    return
  }

  // user check.
  const userId = customer.description
  const user = await getUserByUserId(userId!)
  if (user === null) {
    return
  }

  // subscription check

  // 初回契約時
  if (beforeSubscriptionStatus === 'incomplete' && subscriptionStatus === 'active') {
    const richMenuId = await getRichMenuId('active')
    await Promise.all([
      updateUserDb(userId!, { isActive: true }),
      lineClient.pushMessage(userId!, makeReplyMessage('課金したよ！')),
      richMenuId && lineClient.linkRichMenuToUser(userId!, richMenuId)
    ])
  }

  // 契約更新に失敗した時
  else if (beforeSubscriptionStatus === 'active' && subscriptionStatus === 'past_due') {
    //
  }
}
