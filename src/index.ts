import * as functions from 'firebase-functions'
import { apiInstance } from './api'

// Export Firebase Functions
const api = functions.https.onRequest(apiInstance)
export { api }