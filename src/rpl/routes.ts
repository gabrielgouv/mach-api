import * as controllers from './controllers'

export = (app) => {
  app.get('/rpl/update', controllers.updateRPL)
}