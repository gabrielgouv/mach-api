import * as controllers from './controllers'

export = (app) => {
  app.get('/airports/:icao', controllers.getAirportByIcao)
}