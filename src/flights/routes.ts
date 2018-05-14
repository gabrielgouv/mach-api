import * as controllers from './controllers'

export = (app) => {
  app.get('/flights', controllers.getFlights)
  app.get('/flights/:id', controllers.getFlightById)
}