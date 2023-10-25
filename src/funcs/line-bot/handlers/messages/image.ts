import { ImageEventMessage, MessageEvent } from '@line/bot-sdk'

import { lineClient } from '~/clients/line.client'
import { getMessageContentWithBuffer } from '~/domains/line.domain'
import { minusUserPoint } from '~/domains/point.domain'
import { getStripeCheckoutURL, getStripeCustomerIdByUserId } from '~/domains/stripe.domain'
import { getUserByUserId } from '~/domains/user.domain'
import { imageToText } from '~/domains/vision.domain'
import { makeReplyMessage } from '~/utils/line.util'
import { errorLogger } from '~/utils/util'

import { msgNotText } from '../../notice-messages/other'
import { PRICE_ID } from '~/utils/secrets'

export const messageImageHandler = async (event: MessageEvent): Promise<void> => {
  try {
    const userId = String(event.source.userId)
    const { id: messageId } = event.message as ImageEventMessage

    const user = await getUserByUserId(userId)

    if (user.point <= 0) {

      //ユーザーに単発課金URLを発行して送信する一連のまとまり
      const stripeCustomerId = await getStripeCustomerIdByUserId(userId)
      const { url } = await getStripeCheckoutURL({
        stripeCustomer: stripeCustomerId,
        priceId: PRICE_ID,
        mode: 'payment'
      })
      await lineClient.replyMessage(
        event.replyToken,
        makeReplyMessage(`ポイントが足りません。\n決済はこちらからお願いします。\n\n${url}`)
      )

      // 画像を返す時はこれを使う。
      // await lineClient.pushMessage(event.source.userId!,makerReplyImageMessage(url)

      return
    }

    const imageBuffer = await getMessageContentWithBuffer(messageId)
    let text = await imageToText(imageBuffer)

    if (text === null) {
      await lineClient.replyMessage(event.replyToken, msgNotText)
    } else {
      text = text.substring(0, 5000)
      await lineClient.replyMessage(event.replyToken, makeReplyMessage(text))
      await minusUserPoint(userId, 1)
    }
  } catch (err) {
    errorLogger(err)
    throw new Error('message image handler')
  }
}
