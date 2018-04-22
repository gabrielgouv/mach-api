import * as functions from 'firebase-functions'
import { Flights } from './controllers'

export const getFlights = functions.https.onRequest(async (req, res) => {
  const flights = new Flights(res)
  res.send(await flights.getFlights(req.query))
})

export const getFlightsByDep = functions.https.onRequest(async (req, res) => {
  const flights = new Flights(res)
  res.send(await flights.getFlightsByDep(req.query))
})

export const getFlightsByArr = functions.https.onRequest(async (req, res) => {
  const flights = new Flights(res)
  res.send(await flights.getFlightsByArr(req.query))
})

export const getFlightsByCompany = functions.https.onRequest(async (req, res) => {
  const flights = new Flights(res)
  res.send(await flights.getFlightsByCompany(req.query))
})

export const getFlightById = functions.https.onRequest(async (req, res) => {
  const flights = new Flights(res)
  res.send(await flights.getFlightById(req.query))
})