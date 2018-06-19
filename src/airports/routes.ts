import AirportsControllers from './controllers'
import { Application } from 'express'

export default class AirportsRoutes {

  static routes (app : Application) {
    app.get('/airports/:icao', AirportsControllers.getAirport)
  }

}