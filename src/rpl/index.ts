import * as functions from 'firebase-functions'
import { Rpl } from './controllers'

export const updateRpl = functions.https.onRequest(async (req, res) => {
  const rpl = new Rpl(res)
  if(await rpl.hasUpdate())
    return res.send(await rpl.updateRpl())
  return res.send('No updates today')
})