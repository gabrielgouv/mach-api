import * as controllers from './controllers'

export = (app) => {
  app.get('/airports/:icao', controllers.getAirportByIcao)
  app.get('/airports/:icao/charts/:type', controllers.getChartsByType)
}