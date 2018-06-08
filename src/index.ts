import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'

// Express
const app = express()
app.use(cors({ origin: true }))

// Routes
require('./flights/routes')(app)
require('./airports/routes')(app)
require('./rpl/routes')(app)
app.get('*', (req, res) => res.redirect('https://jpedroh.github.io/mach/#/developers'))

const api = functions.https.onRequest(app)
export { api }