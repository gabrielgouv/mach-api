import * as functions from 'firebase-functions'
import Api from './api'

// Export Firebase Functions
const api = functions.https.onRequest(Api)
export { api }