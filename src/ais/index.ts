import * as functions from 'firebase-functions'
import { Ais } from './controllers'
const cors = require('cors')({origin: true});

export const getCharts = functions.https.onRequest(async (req, res) => {
  cors(req, res, () => true)
  const ais = new Ais(req.query.apt, res)
  res.send(await ais.getCharts())
})

export const getNotams = functions.https.onRequest(async (req, res) => {
  cors(req, res, () => true)
  const ais = new Ais(req.query.apt, res)
  res.send(await ais.getNotams())
})