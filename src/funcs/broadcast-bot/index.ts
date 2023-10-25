//20時に定期実行できるスクリプト

import { region, RuntimeOptions } from 'firebase-functions'

import { getUsers } from '~/libs/firebase/firestore/user'
import { lineClient } from '~/utils/line'
import { makeReplyMessage } from '~/utils/line'

// *************
// Functions設定

const runtimeOpts: RuntimeOptions = {
  timeoutSeconds: 540,
  memory: '1GB'
}
// 20時に定期実行するようの設定
module.exports = region('asia-northeast1')
  .runWith(runtimeOpts)
  .pubsub.schedule('0 20 * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    //行う処理 userId
    // 多いことが予想される場合は、chunkして1単位ずつ処理する
    const users = await getUsers()
    console.info(users)

    await Promise.all(
      users.map((user) =>
        lineClient.pushMessage(user.id!, makeReplyMessage(''))
      )
    )

    return null
  })
