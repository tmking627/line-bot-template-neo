import { WebhookEvent } from '@line/bot-sdk'

import { lineClient } from '~/clients/line.client'
import { errorLogger } from '~/utils/util'
import { msgError } from '~lineBot/notice-messages/other'

import { followHandler } from './follow'
import { messagesHandler } from './messages'
import { postbackHandler } from './postback'

export const handlers = async (event: WebhookEvent): Promise<void> => {
  try {
    switch (event.type) {
      case 'follow':
        return await followHandler(event)
      case 'message':
        return await messagesHandler(event)
      case 'postback':
        return await postbackHandler(event)
      default:
    }
  } catch (err) {
    lineClient.pushMessage(event.source.userId!, msgError).catch
    errorLogger(err)
    throw new Error('handlers')
  }
}
