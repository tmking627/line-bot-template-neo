import { middleware } from '@line/bot-sdk'
import express from 'express'
import { logger, region, RuntimeOptions } from 'firebase-functions'

import { lineMiddlewareConfig } from '~/clients/line.client'
import { errorLogger } from '~/utils/util'

import { handlers } from './handlers'

const app = express()

app.use(middleware(lineMiddlewareConfig))
app.post('/', (req, res) =>
  Promise.all(req.body.events.map(handlers))
    .then((result) => {
      logger.info(result)
      res.status(200).end()
    })
    .catch((err) => {
      errorLogger(err)
      res.status(500).end()
    })
)

// Error.prepareStackTrace = function(error, stack) {
//   return 'Error: ' + error.message + '\n' + stack.map(function(frame) {
//       const filename = frame.getFileName() as string;
//       const lineNumber = frame.getLineNumber() as number;
//       return '    at ' + filename+ ' :' + lineNumber;
//   }).join('\n');
// };


// *************
// Functions設定

const runtimeOpts: RuntimeOptions = {
  timeoutSeconds: 540,
  memory: '1GB'
}

module.exports = region('asia-northeast1').runWith(runtimeOpts).https.onRequest(app)
