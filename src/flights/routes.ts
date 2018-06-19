import FlightsControllers from './controllers'
import { Application } from 'express'

export default class FlightsRoutes {

  static routes (app : Application) {
    app.get('/flights', FlightsControllers.getFlights)
    app.get('/flights/:id', FlightsControllers.getFlightById)
  }

}