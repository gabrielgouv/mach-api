import * as functions from 'firebase-functions'
import * as controllers from './controllers'
const cors = require('cors')({origin: true});

export const getAirport = functions.https.onRequest(async (req, res) => {
  cors(req, res, () => true)
  if (!req.query.apt)
    return res.sendStatus(400)
  const airport = req.query.apt
  return res.send({
    data: await controllers.getData(airport).catch(err => res.sendStatus(500)),
    charts: await controllers.getCharts(airport).catch(err => res.sendStatus(500)),
    notams: await controllers.getNotams(airport).catch(err => res.sendStatus(500))
  })
})