// Update Rpl Functions
import { updateRpl } from './rpl'
export { updateRpl }

// Airports Functions
import { getAirport } from './airports'
export { getAirport }

import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'

// Express
const app = express()
app.use(cors({ origin: true }))

// Flight routes
require('./flights/routes')(app)

const api = functions.https.onRequest(app)
export { api }